
import Skills from "../modules/users/skills.schema.js";
import { AppError } from "../utils/appError.js";
import logger from "../utils/logger.js";

class SkillService {
  /**
   * Create a new skill
   * @param {string} userId - User ID
   * @param {Object} skillData - Skill data
   * @returns {Promise<Object>} Created skill
   */
  async createSkill(userId, skillData) {
    try {
      const { name, description, category } = skillData;

   
      const nameRegex = new RegExp(`^${this._escapeRegExp(name)}$`, "i");
      const existing = await Skills.findOne({
        user_id: userId,
        name: nameRegex,
      });

      if (existing) {
        throw new AppError("DUPLICATE_RESOURCE", "You already have a skill with this name", 409);
      }

      const newSkill = await Skills.create({
        user_id: userId,
        name: name.trim(),
        description: description?.trim(),
        category: category.trim(),
        status: "Active",
        current_stage: "Beginner",
        archived_at: null,
      });

      logger.info(`Skill created: ${newSkill._id} for user: ${userId}`);
      return newSkill;
    } catch (error) {
      logger.error(`Failed to create skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user's skills with pagination, filtering, and sorting
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Skills and metadata
   */
  async getUserSkills(userId, options = {}) {
    try {
      const {
        status,
        category,
        sort = "createdAt:desc",
        limit = 20,
        cursor,
      } = options;

      const query = { user_id: userId };

      // Apply filters
      if (status) {
        query.status = status;
      }
      if (category) {
        query.category = category;
      }

      // Handle cursor pagination
      if (cursor) {
        const decodedCursor = Buffer.from(cursor, "base64").toString("utf-8");
        const [field, direction, value] = decodedCursor.split("|");

        if (direction === "asc") {
          query[field] = { $gt: value };
        } else {
          query[field] = { $lt: value };
        }
      }

      // Parse sort
      const [sortField, sortDirection] = sort.split(":");
      const sortOrder = sortDirection === "asc" ? 1 : -1;
      const sortObj = { [sortField]: sortOrder };

      // Fetch one extra to determine if there are more records
      const skills = await Skills.find(query)
        .sort(sortObj)
        .limit(limit + 1)
        .lean();

      const hasMore = skills.length > limit;
      const results = hasMore ? skills.slice(0, limit) : skills;

      // Generate next cursor
      let nextCursor = null;
      if (hasMore && results.length > 0) {
        const lastItem = results[results.length - 1];
        const cursorValue = lastItem[sortField];
        nextCursor = Buffer.from(
          `${sortField}|${sortDirection}|${cursorValue}`
        ).toString("base64");
      }

      return {
        data: results,
        meta: {
          nextCursor,
          hasMore,
          count: results.length,
        },
      };
    } catch (error) {
      logger.error(`Failed to get user skills: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a single skill by ID
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @returns {Promise<Object>} Skill document
   */
  async getSkillById(userId, skillId) {
    try {
      const skill = await Skills.findOne({
        _id: skillId,
        user_id: userId,
      });

      if (!skill) {
        throw new AppError("NOT_FOUND", "Skill not found or access denied", 404);
      }

      return skill;
    } catch (error) {
      logger.error(`Failed to get skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated skill
   */
  async updateSkill(userId, skillId, updates) {
    try {
      const allowedFields = ["name", "description", "category"];
      const sanitizedUpdates = {};

      for (const field of allowedFields) {
        if (updates[field] !== undefined) {
          sanitizedUpdates[field] = updates[field];
        }
      }

      if (Object.keys(sanitizedUpdates).length === 0) {
        throw new AppError(
          "VALIDATION_ERROR",
          "No valid fields provided for updates",
          422
        );
      }

      // Trim string fields
      for (const key in sanitizedUpdates) {
        if (typeof sanitizedUpdates[key] === "string") {
          sanitizedUpdates[key] = sanitizedUpdates[key].trim();
        }
      }

      const updatedSkill = await Skills.findOneAndUpdate(
        { _id: skillId, user_id: userId },
        { $set: sanitizedUpdates },
        { new: true, runValidators: true }
      );

      if (!updatedSkill) {
        throw new AppError("NOT_FOUND", "Skill not found or access denied", 404);
      }

      logger.info(`Skill updated: ${skillId} for user: ${userId}`);
      return updatedSkill;
    } catch (error) {
      logger.error(`Failed to update skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @returns {Promise<Object>} Archived skill
   */
  async archiveSkill(userId, skillId) {
    try {
      const skill = await this.getSkillById(userId, skillId);

      if (skill.status === "Archived") {
        throw new AppError(
          "INVALID_STATE",
          "Skill is already archived",
          409
        );
      }

      skill.status = "Archived";
      skill.archived_at = new Date();
      await skill.save();

      logger.info(`Skill archived: ${skillId} for user: ${userId}`);
      return skill;
    } catch (error) {
      logger.error(`Failed to archive skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Reactivate a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @returns {Promise<Object>} Reactivated skill
   */
  async reactivateSkill(userId, skillId) {
    try {
      const skill = await this.getSkillById(userId, skillId);

      if (skill.status === "Active") {
        throw new AppError(
          "INVALID_STATE",
          "Skill is already active",
          409
        );
      }

      skill.status = "Active";
      skill.archived_at = null;
      await skill.save();

      logger.info(`Skill reactivated: ${skillId} for user: ${userId}`);
      return skill;
    } catch (error) {
      logger.error(`Failed to reactivate skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a skill
   * @param {string} userId - User ID
   * @param {string} skillId - Skill ID
   * @returns {Promise<void>}
   */
  async deleteSkill(userId, skillId) {
    try {
      const skill = await this.getSkillById(userId, skillId);
      await skill.deleteOne();
      logger.info(`Skill deleted: ${skillId} for user: ${userId}`);
    } catch (error) {
      logger.error(`Failed to delete skill: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete multiple skills
   * @param {string} userId - User ID
   * @param {Array} skillIds - Skill IDs to delete
   * @returns {Promise<Object>} Deletion result
   */
  async deleteMultipleSkills(userId, skillIds) {
    try {
      if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
        throw new AppError(
          "VALIDATION_ERROR",
          "No skill IDs provided",
          422
        );
      }

      const result = await Skills.deleteMany({
        _id: { $in: skillIds },
        user_id: userId,
      });

      if (result.deletedCount === 0) {
        throw new AppError(
          "NOT_FOUND",
          "No skills were deleted. They may not exist or do not belong to you",
          404
        );
      }

      logger.info(
        `${result.deletedCount} skills deleted for user: ${userId}`
      );
      return {
        requested: skillIds.length,
        deleted: result.deletedCount,
      };
    } catch (error) {
      logger.error(`Failed to delete multiple skills: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get skills by category (for analytics)
   * @param {string} userId - User ID
   * @param {string} category - Category filter
   * @returns {Promise<Array>} Skills in category
   */
  async getSkillsByCategory(userId, category) {
    try {
      return await Skills.find({
        user_id: userId,
        category,
        status: "Active",
      }).lean();
    } catch (error) {
      logger.error(`Failed to get skills by category: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Escape special regex characters
   * @private
   */
  _escapeRegExp(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}

export default new SkillService();
