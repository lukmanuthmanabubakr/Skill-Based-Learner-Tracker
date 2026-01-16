import analyticsService from "../services/analyticsService.js";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

export const getSkillProgress = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { skillId } = req.params;

    if (!userId) {
      throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
    }

    if (!skillId) {
      throw new AppError("VALIDATION_ERROR", "Skill ID is required", 422);
    }

    const progress = await analyticsService.getSkillProgress(userId, skillId);

    logger.info("Skill progress retrieved", { userId, skillId });

    return res.status(200).json({
      success: true,
      data: progress,
      meta: { message: "Skill progress retrieved successfully" },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get skill progress failed: ${error.message}`, { code: error.code, userId: req.user?.id });
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get skill progress: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve skill progress",
      },
    });
  }
};

export const getUserSummary = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
    }

    const summary = await analyticsService.getUserSummary(userId);

    logger.info("User summary retrieved", { userId });

    return res.status(200).json({
      success: true,
      data: summary,
      meta: { message: "User summary retrieved successfully" },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get user summary failed: ${error.message}`, { userId: req.user?.id });
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get user summary: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve user summary",
      },
    });
  }
};

export const getSkillTimeline = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { skillId } = req.params;

    if (!userId) {
      throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
    }

    if (!skillId) {
      throw new AppError("VALIDATION_ERROR", "Skill ID is required", 422);
    }

    const timeline = await analyticsService.getSkillTimeline(userId, skillId);

    logger.info("Skill timeline retrieved", { userId, skillId });

    return res.status(200).json({
      success: true,
      data: timeline,
      meta: { message: "Skill timeline retrieved successfully" },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get skill timeline failed: ${error.message}`, { code: error.code, userId: req.user?.id });
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get skill timeline: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve skill timeline",
      },
    });
  }
};

export const getUserStreaks = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      throw new AppError("UNAUTHORIZED", "User not authenticated", 401);
    }

    const streaks = await analyticsService.getUserStreaks(userId);

    logger.info("User streaks retrieved", { userId });

    return res.status(200).json({
      success: true,
      data: streaks,
      meta: { message: "User streaks retrieved successfully" },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get user streaks failed: ${error.message}`, { userId: req.user?.id });
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get user streaks: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve user streaks",
      },
    });
  }
};
