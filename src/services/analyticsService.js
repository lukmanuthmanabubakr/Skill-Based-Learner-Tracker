import PracticeLogs from "../modules/users/practiceLog.schema.js";
import Skills from "../modules/users/skills.schema.js";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

class AnalyticsService {
  async getSkillProgress(userId, skillId) {
    try {
      const skill = await Skills.findOne({
        _id: skillId,
        user_id: userId,
      });

      if (!skill) {
        throw new AppError("SKILL_NOT_FOUND", "Skill not found", 404);
      }

      const practiceLogs = await PracticeLogs.find({
        skill_id: skillId,
        user_id: userId,
      }).sort({ createdAt: -1 });

      const totalDuration = practiceLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const sessionCount = practiceLogs.length;
      const averageDuration = sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;

      const lastSession = practiceLogs[0];
      const lastPracticeDate = lastSession ? lastSession.createdAt : null;

      return {
        skillId,
        skillName: skill.name,
        category: skill.category,
        status: skill.status,
        currentStage: skill.current_stage,
        totalDuration,
        sessionCount,
        averageDuration,
        lastPracticeDate,
        progressPercentage: this._calculateProgressPercentage(skill.current_stage),
      };
    } catch (error) {
      logger.error(`Failed to get skill progress: ${error.message}`);
      throw error;
    }
  }

  async getUserSummary(userId) {
    try {
      const skills = await Skills.find({
        user_id: userId,
        archived_at: null,
      });

      const skillIds = skills.map(s => s._id);
      const practiceLogs = await PracticeLogs.find({
        user_id: userId,
      });

      const totalPracticeTime = practiceLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const totalSessions = practiceLogs.length;
      const activeSkills = skills.filter(s => s.status === "Active").length;

      const skillProgress = skills.map(skill => ({
        skillId: skill._id,
        skillName: skill.name,
        currentStage: skill.current_stage,
        status: skill.status,
      }));

      return {
        userId,
        totalSkills: skills.length,
        activeSkills,
        totalPracticeTime,
        totalSessions,
        averageSessionTime: totalSessions > 0 ? Math.round(totalPracticeTime / totalSessions) : 0,
        skills: skillProgress,
      };
    } catch (error) {
      logger.error(`Failed to get user summary: ${error.message}`);
      throw error;
    }
  }

  async getSkillTimeline(userId, skillId) {
    try {
      const skill = await Skills.findOne({
        _id: skillId,
        user_id: userId,
      });

      if (!skill) {
        throw new AppError("SKILL_NOT_FOUND", "Skill not found", 404);
      }

      const practiceLogs = await PracticeLogs.find({
        skill_id: skillId,
        user_id: userId,
      }).sort({ createdAt: 1 });

      const timeline = practiceLogs.map(log => ({
        date: log.createdAt,
        duration: log.duration,
        focusArea: log.focusArea,
        notes: log.notes,
      }));

      return {
        skillId,
        skillName: skill.name,
        timeline,
        totalEntries: timeline.length,
      };
    } catch (error) {
      logger.error(`Failed to get skill timeline: ${error.message}`);
      throw error;
    }
  }

  async getUserStreaks(userId) {
    try {
      const practiceLogs = await PracticeLogs.find({
        user_id: userId,
      }).sort({ createdAt: -1 });

      if (practiceLogs.length === 0) {
        return {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          streakLastUpdated: null,
        };
      }

      const currentStreak = this._calculateStreak(practiceLogs);
      const longestStreak = this._calculateLongestStreak(practiceLogs);

      return {
        userId,
        currentStreak,
        longestStreak,
        streakLastUpdated: practiceLogs[0].createdAt,
      };
    } catch (error) {
      logger.error(`Failed to get user streaks: ${error.message}`);
      throw error;
    }
  }

  _calculateProgressPercentage(currentStage) {
    const stages = ["Beginner", "Intermediate", "Advanced", "Expert"];
    const stageIndex = stages.indexOf(currentStage);
    return stageIndex >= 0 ? Math.round((stageIndex / (stages.length - 1)) * 100) : 0;
  }

  _calculateStreak(logs) {
    if (logs.length === 0) return 0;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastDate = new Date(logs[0].createdAt);
    lastDate.setHours(0, 0, 0, 0);

    const daysDifference = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    if (daysDifference > 1) {
      return 0;
    }

    for (let i = 1; i < logs.length; i++) {
      const currentDate = new Date(logs[i].createdAt);
      currentDate.setHours(0, 0, 0, 0);

      const diff = Math.floor((lastDate - currentDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        streak++;
        lastDate = currentDate;
      } else if (diff > 1) {
        break;
      }
    }

    return streak;
  }

  _calculateLongestStreak(logs) {
    if (logs.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    const sortedLogs = [...logs].reverse();

    for (let i = 1; i < sortedLogs.length; i++) {
      const prevDate = new Date(sortedLogs[i - 1].createdAt);
      const currDate = new Date(sortedLogs[i].createdAt);

      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);

      const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));

      if (diff === 1) {
        currentStreak++;
      } else if (diff > 1) {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    return Math.max(longestStreak, currentStreak);
  }
}

export default new AnalyticsService();
