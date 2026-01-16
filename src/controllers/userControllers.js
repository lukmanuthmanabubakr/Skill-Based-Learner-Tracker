import express from "express";
import User from "../modules/users/user.schema.js";
import generateToken from "../utils/token.js";

// The Registration Logic
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //   To check if there is no, name or email or password
    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing fields are required",
        },
      });
    }

    //   To check the password strenth
    if (password.length < 10) {
      return res.status(409).json({
        success: false,
        error: {
          code: "PASSWORD_ERROR",
          message: "Password should be at least 10 characters",
        },
      });
    }

    //   check if users exist
    const user = await User.findOne({ email });
    if (user) {
      return res.status(409).json({
        suucess: false,
        error: {
          code: "USER_EXIST",
          message: "User already exists",
        },
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
    });

    const token = generateToken.generate(newUser.id);

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
        token: token,
      },
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({
        success: false,
        data: {
          code: "VALIDATION_ERROR",
          message: "Missing field is required",
        },
      });
    }

    //   check if users exist
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        suucess: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User does not exist",
        },
      });
    }

    const checkPassword = await user.matchPassword(password);
    if (!checkPassword) {
      return res.status(404).json({
        suucess: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid email or password",
        },
      });
    }

    const token = generateToken.generate(user._id);
    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "User LoggedIn succuedsfully",
      data: {
        token,
        user,
      },
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
export const getUser = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        suucess: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User does not exist",
        },
      });
    }
    user.password = undefined;
    return res.status(200).json({
      success: true,
      data: {
        user,
      },
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
