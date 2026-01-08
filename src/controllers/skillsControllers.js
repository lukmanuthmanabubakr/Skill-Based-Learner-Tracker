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
        suucess: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Skill name is required",
        },
      });
    }
    if (noSpaceName.length < 3 || noSpaceName.length > 50) {
      return res.status(422).json({
        suucess: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Skill name must be between 3 and 50 characters",
          details: { field: "name", min: 3, max: 50 },
        },
      });
    }
    if (noSpaceDesc && noSpaceDesc.length > 500) {
      return res.status(422).json({
        suucess: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Description must be 500 characters or fewer",
          details: { field: "description", max: 500 },
        },
      });
    }
    if (!noSpaceCategory) {
      return res.status(422).json({
        suucess: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Category is required",
          details: { field: "category" },
        },
      });
    }
    if (!SKILL_CATEGORIES.includes(noSpaceCategory)) {
      return res.status(422).json({
        suucess: false,
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

    const query = {
      user_id: userId,
    };

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    let sort = { createdAt: -1 };

    if (req.query.sort) {
      const [field, direction] = req.query.sort.split(":");
      sort = { [field]: direction === "asc" ? 1 : -1 };
    }
    const userSkills = await Skills.find(query).sort(sort);

    if (userSkills.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Skills is not available yet, create one",
        date: userSkills,
        meta: {},
      });
    }
    return res.status(201).json({
      success: true,
      data: userSkills,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
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
        suucess: false,
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
