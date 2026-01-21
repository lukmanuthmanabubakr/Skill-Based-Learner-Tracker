// services/skillRankingService.js
import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

const STAGE_WEIGHT = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

class SkillRankingService {
  // ✅ Uses your Practice schema: skill_id, user_id, duration, date_practiced
  getRankingByHoursPracticed = async () => {
    try {
      const Practice = mongoose.model("Practice");

      const rankings = await Practice.aggregate([
        {
          $group: {
            _id: "$skill_id",
            totalMinutes: { $sum: "$duration" },
            sessionCount: { $sum: 1 },
            lastPractice: { $max: "$date_practiced" },
          },
        },
        {
          $lookup: {
            from: "skills",
            localField: "_id",
            foreignField: "_id",
            as: "skillDetails",
          },
        },
        {
          $unwind: {
            path: "$skillDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "skillDetails.user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            _id: 0,
            skillId: "$_id",
            skillName: "$skillDetails.name",
            category: "$skillDetails.category",
            totalMinutes: 1,
            totalHours: { $divide: ["$totalMinutes", 60] },
            sessionCount: 1,
            lastPractice: 1,
            userName: "$userDetails.name",
            userEmail: "$userDetails.email",
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: 100 },
      ]);

      logger.info("Ranking by hours practiced retrieved", {
        count: rankings.length,
      });

      return rankings;
    } catch (error) {
      logger.error("Error in getRankingByHoursPracticed", {
        message: error.message,
        stack: error.stack,
      });
      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve rankings by hours practiced",
        500
      );
    }
  };

  // ✅ Uses your Skills schema fields: name, category, user_id, current_stage
  // If your schema uses "current_stage" (as in your skills controller), this will work.
  getRankingByMilestones = async () => {
    try {
      const Skills = mongoose.model("Skills");

      const rankings = await Skills.aggregate([
        {
          $project: {
            _id: 1,
            name: 1,
            category: 1,
            user_id: 1,
            current_stage: 1,
            milestonesReached: {
              $switch: {
                branches: [
                  { case: { $eq: ["$current_stage", "Expert"] }, then: 4 },
                  { case: { $eq: ["$current_stage", "Advanced"] }, then: 3 },
                  {
                    case: { $eq: ["$current_stage", "Intermediate"] },
                    then: 2,
                  },
                  { case: { $eq: ["$current_stage", "Beginner"] }, then: 1 },
                ],
                default: 0,
              },
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            _id: 0,
            skillId: "$_id",
            skillName: "$name",
            category: 1,
            currentStage: "$current_stage",
            milestonesReached: 1,
            userName: "$userDetails.name",
            userEmail: "$userDetails.email",
          },
        },
        { $sort: { milestonesReached: -1 } },
        { $limit: 100 },
      ]);

      logger.info("Ranking by milestones retrieved", { count: rankings.length });
      return rankings;
    } catch (error) {
      logger.error("Error in getRankingByMilestones", {
        message: error.message,
        stack: error.stack,
      });
      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve rankings by milestones",
        500
      );
    }
  };

  // ✅ Leaderboard by users: total practice time across all skills
  getUserLeaderboard = async (limit = 50) => {
    try {
      const Practice = mongoose.model("Practice");

      const parsedLimit = parseInt(limit, 10);
      if (Number.isNaN(parsedLimit)) {
        throw new AppError("VALIDATION_ERROR", "Limit must be a valid number", 422);
      }
      if (parsedLimit > 1000 || parsedLimit < 1) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Limit must be between 1 and 1000",
          422
        );
      }

      const rows = await Practice.aggregate([
        {
          $group: {
            _id: "$user_id",
            totalMinutes: { $sum: "$duration" },
            totalSessions: { $sum: 1 },
            skillsSet: { $addToSet: "$skill_id" },
            lastPractice: { $max: "$date_practiced" },
          },
        },
        {
          $project: {
            _id: 1,
            totalMinutes: 1,
            totalHours: { $divide: ["$totalMinutes", 60] },
            totalSessions: 1,
            uniqueSkills: { $size: "$skillsSet" },
            lastPractice: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            userName: "$userDetails.name",
            userEmail: "$userDetails.email",
            totalMinutes: 1,
            totalHours: 1,
            totalSessions: 1,
            uniqueSkills: 1,
            lastPractice: 1,
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: parsedLimit },
      ]);

      const ranked = rows.map((u, i) => ({ ...u, rank: i + 1 }));

      logger.info("User leaderboard retrieved", { count: ranked.length });
      return ranked;
    } catch (error) {
      logger.error("Error in getUserLeaderboard", {
        message: error.message,
        stack: error.stack,
      });
      throw new AppError("RANKING_ERROR", "Failed to retrieve user leaderboard", 500);
    }
  };

  // ✅ Leaderboard for a single skill: rank users by minutes practised on that skill
  getSkillLeaderboard = async (skillId, limit = 50) => {
    try {
      if (!skillId) {
        throw new AppError("VALIDATION_ERROR", "Skill ID is required", 422);
      }
      if (!mongoose.isValidObjectId(skillId)) {
        throw new AppError("VALIDATION_ERROR", "Skill ID must be a valid ObjectId", 422);
      }

      const parsedLimit = parseInt(limit, 10);
      if (Number.isNaN(parsedLimit)) {
        throw new AppError("VALIDATION_ERROR", "Limit must be a valid number", 422);
      }
      if (parsedLimit > 1000 || parsedLimit < 1) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Limit must be between 1 and 1000",
          422
        );
      }

      const Practice = mongoose.model("Practice");
      const Skills = mongoose.model("Skills");

      // Ensure skill exists (optional but helps return a better error)
      const skillExists = await Skills.exists({ _id: skillId });
      if (!skillExists) {
        throw new AppError("NOT_FOUND", "Skill not found", 404);
      }

      const rows = await Practice.aggregate([
        { $match: { skill_id: new mongoose.Types.ObjectId(skillId) } },
        {
          $group: {
            _id: "$user_id",
            totalMinutes: { $sum: "$duration" },
            totalSessions: { $sum: 1 },
            lastPractice: { $max: "$date_practiced" },
          },
        },
        {
          $project: {
            _id: 1,
            totalMinutes: 1,
            totalHours: { $divide: ["$totalMinutes", 60] },
            totalSessions: 1,
            lastPractice: 1,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          // pull the skill stage for THIS user + THIS skill (ownership model)
          $lookup: {
            from: "skills",
            let: {
              userId: "$_id",
              skillObjId: new mongoose.Types.ObjectId(skillId),
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$_id", "$$skillObjId"] },
                      { $eq: ["$user_id", "$$userId"] },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 0,
                  current_stage: 1,
                },
              },
            ],
            as: "skillDetails",
          },
        },
        {
          $project: {
            _id: 0,
            userId: "$_id",
            userName: "$userDetails.name",
            userEmail: "$userDetails.email",
            totalMinutes: 1,
            totalHours: 1,
            totalSessions: 1,
            lastPractice: 1,
            skillStage: {
              $ifNull: [
                { $arrayElemAt: ["$skillDetails.current_stage", 0] },
                "Not Started",
              ],
            },
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: parsedLimit },
      ]);

      const ranked = rows.map((u, i) => ({ ...u, rank: i + 1 }));

      logger.info("Skill leaderboard retrieved", { skillId, count: ranked.length });
      return ranked;
    } catch (error) {
      logger.error("Error in getSkillLeaderboard", {
        message: error.message,
        stack: error.stack,
      });

      // Preserve AppError codes/status
      if (error instanceof AppError) throw error;

      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve skill leaderboard",
        500
      );
    }
  };
}

export default new SkillRankingService();
