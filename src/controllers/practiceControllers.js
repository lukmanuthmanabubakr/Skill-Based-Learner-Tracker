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

    const { skillId, from, to, sort, page = 1, limit = 10 } = req.query;

    const ALLOWED_SORT_FIELDS = ["date_practiced"];

    const query = {
      user_id: userId,
    };

    if (skillId) {
      query.skill_id = skillId;
    }

    if (from || to) {
      query.date_practiced = {};
      if (from) {
        query.date_practiced.$gte = new Date(from);
      }
      if (to) {
        query.date_practiced.$lte = new Date(to);
      }
    }

    let sortOption = { date_practiced: -1 };
    if (sort) {
      const [field, direction] = sort.split(":");
      if (!ALLOWED_SORT_FIELDS.includes(field)) {
        return res.status(400).json({
          success: false,
          message: "Invalid sort field",
        });
      }
      sortOption = { [field]: direction === "asc" ? 1 : -1 };
    }

    const safePage = Math.max(parseInt(page), 1);
    const safeLimit = Math.min(parseInt(limit), 50);
    const skip = (safePage - 1) * safeLimit;

    const [practiceLogs, total] = await Promise.all([
      Practice.find(query).sort(sortOption).skip(skip).limit(safeLimit),
      Practice.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: practiceLogs,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        filters: {
          skillId: skillId || null,
          from: from || null,
          to: to || null,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSessionPractice = async (req, res) => {
  try {
    const userId = req.user.id;
    const practiceId = req.params.practiceId;

    const ALLOWED_UPDATES = [
      "description",
      "duration",
      "date_practiced",
      "difficulty_rating",
      "confidence_rating",
    ];

    const updates = {};

    for (const field of ALLOWED_UPDATES) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

  
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedPractice = await Practice.findOneAndUpdate(
      {
        _id: practiceId,
        user_id: userId,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPractice) {
      return res.status(404).json({
        success: false,
        message: "Practice log not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPractice,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
