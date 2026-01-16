import mongoose from "mongoose";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

class SkillRankingService {
  getRankingByHoursPracticed = async () => {
    try {
      const PracticeLog = mongoose.model("PracticeLog");
      const rankings = await PracticeLog.aggregate([
        {
          $group: {
            _id: "$skillId",
            totalMinutes: { $sum: "$durationMinutes" },
            sessionCount: { $sum: 1 },
            lastPractice: { $max: "$practiceDate" },
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
        { $unwind: "$skillDetails" },
        {
          $lookup: {
            from: "users",
            localField: "skillDetails.userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            skillName: "$skillDetails.skillName",
            category: "$skillDetails.category",
            totalHours: { $divide: ["$totalMinutes", 60] },
            totalMinutes: 1,
            sessionCount: 1,
            lastPractice: 1,
            userName: "$userDetails.userName",
            userEmail: "$userDetails.email",
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: 100 },
      ]);

      logger.info("Ranking by hours practiced retrieved", { count: rankings.length });
      return rankings;
    } catch (error) {
      logger.error(`Error in getRankingByHoursPracticed: ${error.message}`);
      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve rankings by hours practiced",
        500
      );
    }
  }

  getRankingByMilestones = async () => {
    try {
      const Skill = mongoose.model("Skill");
      const rankings = await Skill.aggregate([
        {
          $project: {
            skillName: 1,
            category: 1,
            userId: 1,
            currentStage: 1,
            stageCompletionDate: 1,
            milestonesReached: {
              $cond: [
                { $eq: ["$currentStage", "Expert"] },
                5,
                {
                  $cond: [
                    { $eq: ["$currentStage", "Advanced"] },
                    4,
                    {
                      $cond: [
                        { $eq: ["$currentStage", "Intermediate"] },
                        3,
                        { $cond: [{ $eq: ["$currentStage", "Beginner"] }, 2, 1] },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            skillName: 1,
            category: 1,
            currentStage: 1,
            stageCompletionDate: 1,
            milestonesReached: 1,
            userName: "$userDetails.userName",
            userEmail: "$userDetails.email",
          },
        },
        { $sort: { milestonesReached: -1, stageCompletionDate: -1 } },
        { $limit: 100 },
      ]);

      logger.info("Ranking by milestones retrieved", { count: rankings.length });
      return rankings;
    } catch (error) {
      logger.error(`Error in getRankingByMilestones: ${error.message}`);
      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve rankings by milestones",
        500
      );
    }
  }

  getUserLeaderboard = async (limit = 50) => {
    try {
      const PracticeLog = mongoose.model("PracticeLog");
      if (limit > 1000 || limit < 1) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Limit must be between 1 and 1000",
          422
        );
      }

      const leaderboard = await PracticeLog.aggregate([
        {
          $group: {
            _id: "$userId",
            totalMinutes: { $sum: "$durationMinutes" },
            totalSessions: { $sum: 1 },
            skillsCount: { $addToSet: "$skillId" },
          },
        },
        {
          $project: {
            _id: 1,
            totalHours: { $divide: ["$totalMinutes", 60] },
            totalMinutes: 1,
            totalSessions: 1,
            uniqueSkills: { $size: "$skillsCount" },
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
        { $unwind: "$userDetails" },
        {
          $project: {
            _id: 1,
            userName: "$userDetails.userName",
            userEmail: "$userDetails.email",
            totalHours: 1,
            totalMinutes: 1,
            totalSessions: 1,
            uniqueSkills: 1,
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: limit },
        {
          $facet: {
            topUsers: [
              { $skip: 0 },
              {
                $addFields: {
                  rank: { $add: [1] },
                },
              },
            ],
          },
        },
      ]);

      let rankedLeaderboard = [];
      if (leaderboard[0]?.topUsers) {
        rankedLeaderboard = leaderboard[0].topUsers.map((user, index) => ({
          ...user,
          rank: index + 1,
        }));
      }

      logger.info("User leaderboard retrieved", { count: rankedLeaderboard.length });
      return rankedLeaderboard;
    } catch (error) {
      logger.error(`Error in getUserLeaderboard: ${error.message}`);
      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve user leaderboard",
        500
      );
    }
  }

  getSkillLeaderboard = async (skillId, limit = 50) => {
    try {
      const PracticeLog = mongoose.model("PracticeLog");
      if (!skillId) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Skill ID is required",
          422
        );
      }

      if (limit > 1000 || limit < 1) {
        throw new AppError(
          "VALIDATION_ERROR",
          "Limit must be between 1 and 1000",
          422
        );
      }

      const leaderboard = await PracticeLog.aggregate([
        { $match: { skillId: new mongoose.Types.ObjectId(skillId) } },
        {
          $group: {
            _id: "$userId",
            totalMinutes: { $sum: "$durationMinutes" },
            totalSessions: { $sum: 1 },
            lastPractice: { $max: "$practiceDate" },
          },
        },
        {
          $project: {
            _id: 1,
            totalHours: { $divide: ["$totalMinutes", 60] },
            totalMinutes: 1,
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
        { $unwind: "$userDetails" },
        {
          $lookup: {
            from: "skills",
            let: { userId: "$_id", skillId: new mongoose.Types.ObjectId(skillId) },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$userId", "$$userId"] },
                      { $eq: ["$_id", "$$skillId"] },
                    ],
                  },
                },
              },
            ],
            as: "skillDetails",
          },
        },
        {
          $project: {
            _id: 1,
            userName: "$userDetails.userName",
            userEmail: "$userDetails.email",
            totalHours: 1,
            totalMinutes: 1,
            totalSessions: 1,
            lastPractice: 1,
            skillStage: {
              $ifNull: [{ $arrayElemAt: ["$skillDetails.currentStage", 0] }, "Not Started"],
            },
          },
        },
        { $sort: { totalHours: -1 } },
        { $limit: limit },
      ]);

      const rankedLeaderboard = leaderboard.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));

      logger.info("Skill leaderboard retrieved", { skillId, count: rankedLeaderboard.length });
      return rankedLeaderboard;
    } catch (error) {
      logger.error(`Error in getSkillLeaderboard: ${error.message}`);
      throw new AppError(
        "RANKING_ERROR",
        "Failed to retrieve skill leaderboard",
        500
      );
    }
  }
}

export default new SkillRankingService();
