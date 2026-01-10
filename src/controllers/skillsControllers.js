import mongoose from "mongoose";
import { SKILL_CATEGORIES } from "../constants/skillCategories.js";
import Skills from "../modules/users/skills.schema.js";
const escapeRegExp = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createSkills = async (req, res) => {
  try {
    const { name, description, category } = req.body;
    const userId = req.user;

    const noSpaceName = typeof name === "string" ? name.trim() : "";
    const noSpaceDesc =
      typeof description === "string" ? description.trim() : undefined;
    const noSpaceCategory = typeof category === "string" ? category.trim() : "";

    if (!noSpaceName) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Skill name is required",
        },
      });
    }
    if (noSpaceName.length < 3 || noSpaceName.length > 50) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Skill name must be between 3 and 50 characters",
          details: { field: "name", min: 3, max: 50 },
        },
      });
    }
    if (noSpaceDesc && noSpaceDesc.length > 500) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Description must be 500 characters or fewer",
          details: { field: "description", max: 500 },
        },
      });
    }
    if (!noSpaceCategory) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category is required",
          details: { field: "category" },
        },
      });
    }
    if (!SKILL_CATEGORIES.includes(noSpaceCategory)) {
      return res.status(422).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category must be one in the allowed values",
          details: { field: "category" },
        },
      });
    }

    const nameRegex = new RegExp(`^${escapeRegExp(noSpaceName)}$`, "i");
    const existing = await Skills.findOne({ user_id: userId, name: nameRegex });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: {
          code: "DUPLICATE_RESOURCE",
          message: "You already have a skill with this name",
          details: { field: "name" },
        },
      });
    }

    const newSkills = await Skills.create({
      user_id: userId.id,
      name: noSpaceName,
      description: noSpaceDesc,
      category: noSpaceCategory,
      status: "Active",
      current_stage: "Beginner",
      archived_at: null,
    });

    return res.status(201).json({
      success: true,
      data: newSkills,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;

    const ALLOWED_STATUS = ["Active", "Archived"];
    const ALLOWED_SORT_FIELDS = ["createdAt", "name", "category"];

    // Default query includes only Active skills
    const query = {
      user_id: userId,
    };

    // Override status if query param exists and is valid
    if (req.query.status) {
      if (!ALLOWED_STATUS.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }
      query.status = req.query.status;
    }

    // Add category filter if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Sorting
    let sort = { createdAt: -1 }; // default: newest first
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split(":");
      if (!ALLOWED_SORT_FIELDS.includes(field)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sort field",
        });
      }
      sort = { [field]: direction === "asc" ? 1 : -1 };
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Query database
    const [userSkills, total] = await Promise.all([
      Skills.find(query).sort(sort).skip(skip).limit(limit),
      Skills.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: userSkills,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        status: req.query.status || "all",
        category: query.category || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillsId = req.params.skillId;

    const toUpdate = ["name", "description", "category"];
    const newUpdate = {};

    for (const key of toUpdate) {
      if (req.body[key] !== undefined) {
        newUpdate[key] = req.body[key];
      }
    }

    if (Object.keys(newUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for updates",
      });
    }

    const updatedSkills = await Skills.findOneAndUpdate(
      { _id: skillsId, user_id: userId },
      { $set: newUpdate },
      { new: true }
    );

    if (!updatedSkills) {
      return res.status(404).json({
        success: false,
        message: "Skill not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedSkills,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const archiveSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillsId = req.params.skillId;

    const findSkillsByUser = await Skills.findOne({
      _id: skillsId,
      user_id: userId,
    });

    if (!findSkillsByUser) {
      return res.status(404).json({
        success: false,
        message: "Skills does not exist",
      });
    }
    if (findSkillsByUser.status === "Archived") {
      return res.status(409).json({
        success: false,
        message: "Skills is already in archived",
      });
    }
    findSkillsByUser.status = "Archived";
    findSkillsByUser.archived_at = new Date();

    await findSkillsByUser.save();

    return res.status(200).json({
      success: true,
      data: findSkillsByUser,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const reactivateSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillsId = req.params.skillId;

    const findSkillsByUser = await Skills.findOne({
      _id: skillsId,
      user_id: userId,
    });

    if (!findSkillsByUser) {
      return res.status(403).json({
        success: false,
        message: "Skills does not exist",
      });
    }
    if (findSkillsByUser.status === "Active") {
      return res.status(409).json({
        success: false,
        message: "Skills is already in active",
      });
    }
    findSkillsByUser.status = "Active";
    findSkillsByUser.archived_at = null;

    await findSkillsByUser.save();

    return res.status(200).json({
      success: true,
      data: findSkillsByUser,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillsId = req.params.skillId;

    const findSkillsByUser = await Skills.findOne({
      _id: skillsId,
      user_id: userId,
    });

    if (!findSkillsByUser) {
      return res.status(404).json({
        success: false,
        message: "Skills does not exist",
      });
    }

    await findSkillsByUser.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const multiDeleteSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId); // <-- use 'new'
    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id)); // <-- use 'new'

    const result = await Skills.deleteMany({
      _id: { $in: objectIds },
      user_id: objectUserId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No skills were deleted. They may not exist or do not belong to you.",
        meta: {
          requested: ids.length,
          deleted: result.deletedCount,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Skills deleted successfully",
      meta: {
        requested: ids.length,
        deleted: result.deletedCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
