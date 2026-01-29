import express from "express";
import User from "../modules/users/user.schema.js";
import generateToken from "../utils/token.js";
import { validateObject, userProfileValidationRules } from "../utils/validators.js";
import { AppError, ValidationError } from "../utils/appError.js";
import logger from "../utils/logger.js";

// The Register Logic
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Missing fields are required",
        },
      });
    }

    if (password.length < 10) {
      return res.status(409).json({
        success: false,
        error: {
          code: "PASSWORD_ERROR",
          message: "Password should be at least 10 characters",
        },
      });
    }

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


export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    
    if (!userId) {
      throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
    }

    // Validate input against schema
    const updateData = validateObject(req.body, userProfileValidationRules);

    // Ensure at least one field is being updated
    const fieldsToUpdate = Object.keys(updateData).filter(
      (key) => updateData[key] !== undefined && updateData[key] !== null
    );

    if (fieldsToUpdate.length === 0) {
      throw new ValidationError("No valid fields provided for update", {
        provided: Object.keys(req.body),
      });
    }

    // Update user in database with validation enabled
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    ).select("-password");

    if (!updatedUser) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    // Log the change with correlation ID
    logger.info(`User profile updated: ${userId}`, {
      updatedFields: fieldsToUpdate,
      userId,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
      },
      meta: {
        message: "Profile updated successfully",
      },
    });
  } catch (error) {
    if (error instanceof AppError || error instanceof ValidationError) {
      logger.error(`Profile update failed: ${error.message}`, {
        code: error.code,
        userId: req.user?.id,
      });
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error during profile update: ${error.message}`, {
      userId: req.user?.id,
    });

    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to update profile",
      },
    });
  }
};
