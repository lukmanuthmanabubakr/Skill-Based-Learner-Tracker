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
