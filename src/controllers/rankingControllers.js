import rankingService from "../services/skillRankingService.js";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

export const getRankingByHoursPracticed = async (req, res) => {
  try {
    const rankings = await rankingService.getRankingByHoursPracticed();

    logger.info("Rankings by hours practiced endpoint accessed");

    return res.status(200).json({
      success: true,
      data: rankings,
      meta: {
        message: "Rankings by hours practiced retrieved successfully",
        total: rankings.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get rankings by hours failed: ${error.message}`);
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get rankings by hours: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve rankings",
      },
    });
  }
};

export const getRankingByMilestones = async (req, res) => {
  try {
    const rankings = await rankingService.getRankingByMilestones();

    logger.info("Rankings by milestones endpoint accessed");

    return res.status(200).json({
      success: true,
      data: rankings,
      meta: {
        message: "Rankings by milestones retrieved successfully",
        total: rankings.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get rankings by milestones failed: ${error.message}`);
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get rankings by milestones: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve rankings",
      },
    });
  }
};

export const getUserLeaderboard = async (req, res) => {
  try {
    const { limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;

    if (isNaN(parsedLimit)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Limit must be a valid number",
        422
      );
    }

    const leaderboard = await rankingService.getUserLeaderboard(parsedLimit);

    logger.info("User leaderboard endpoint accessed", { limit: parsedLimit });

    return res.status(200).json({
      success: true,
      data: leaderboard,
      meta: {
        message: "User leaderboard retrieved successfully",
        total: leaderboard.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get user leaderboard failed: ${error.message}`);
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get user leaderboard: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve leaderboard",
      },
    });
  }
};

export const getSkillLeaderboard = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 50;

    if (!skillId) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Skill ID is required",
        422
      );
    }

    if (isNaN(parsedLimit)) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Limit must be a valid number",
        422
      );
    }

    const leaderboard = await rankingService.getSkillLeaderboard(skillId, parsedLimit);

    logger.info("Skill leaderboard endpoint accessed", { skillId, limit: parsedLimit });

    return res.status(200).json({
      success: true,
      data: leaderboard,
      meta: {
        message: "Skill leaderboard retrieved successfully",
        total: leaderboard.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      logger.error(`Get skill leaderboard failed: ${error.message}`);
      return res.status(error.statusCode).json(error.toJSON());
    }

    logger.error(`Unexpected error in get skill leaderboard: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve leaderboard",
      },
    });
  }
};
