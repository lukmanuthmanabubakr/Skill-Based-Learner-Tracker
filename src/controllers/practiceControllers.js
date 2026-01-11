import Practice from "../modules/users/practiceLog.schema.js";
import Skills from "../modules/users/skills.schema.js";

export const createPracticeSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const skillsId = req.params.skillId;

    const {
      date_practiced,
      duration,
      description,
      difficulty_rating,
      confidence_rating,
    } = req.body;

    const noSpaceDesc =
      typeof description === "string" ? description.trim() : undefined;

    if (!date_practiced || !duration || !noSpaceDesc) {
      return res.status(422).json({
        success: false,
        message: "Missing required practice fields",
      });
    }

    const skill = await Skills.findOne({
      _id: skillsId,
      user_id: userId,
    });

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Skill not found.",
      });
    }

    const practice = await Practice.create({
      skill_id: skillsId,
      user_id: userId,
      date_practiced,
      duration,
      description: noSpaceDesc,
      difficulty_rating,
      confidence_rating,
    });

    return res.status(201).json({
      success: true,
      data: practice,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPracticeSession = async (req, res) => {
  try {
    const userId = req.user.id;

    const ALLOWED_SORT_FIELDS = ["date_practiced"];

    const query = {
      user_id: userId,
    };

    let sort = { date_practiced: -1 }; // default: newest first
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

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    const [userPractice, total] = await Promise.all([
      Practice.find(query).sort(sort).skip(skip).limit(limit),
      Practice.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: userPractice,
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
