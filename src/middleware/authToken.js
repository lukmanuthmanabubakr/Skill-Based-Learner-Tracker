import User from "../modules/users/user.schema.js";
import generateToken from "../utils/token.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "Not Authorized, Token missing",
        },
      });
    }

    const token = authHeader.split(" ")[1];
    const decode = generateToken.verify(token);
    const user = await User.findById(decode.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "User no longer exists",
        },
      });
    }
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_ERROR",
        message: "Invalid or expired token",
      },
    });
  }
};
