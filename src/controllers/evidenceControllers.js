import Evidence from "../modules/users/evidenceLog.schema.js";
import Skills from "../modules/users/skills.schema.js";
import Practice from "../modules/users/practiceLog.schema.js";

export const createEvidence = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skill_id, practice_log_id, type, uri, note, metadata } = req.body;

    if (!skill_id && !practice_log_id) {
      return res.status(422).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Either skill_id or practice_log_id is required" },
      });
    }

    if (skill_id && practice_log_id) {
      return res.status(422).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Evidence must belong to either a skill or a practice log" },
      });
    }

    if (skill_id) {
      const skill = await Skills.findOne({ _id: skill_id, user_id: userId });
      if (!skill) {
        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Skill not found or access denied" } });
      }
    }

    if (practice_log_id) {
      const practice = await Practice.findOne({ _id: practice_log_id, user_id: userId });
      if (!practice) {
        return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "Practice log not found or access denied" } });
      }
    }

    const created = await Evidence.create({
      practice_log_id: practice_log_id || null,
      skill_id: skill_id || null,
      user_id: userId,
      type,
      uri,
      note,
      metadata,
    });

    return res.status(201).json({ success: true, data: created, meta: {} });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getEvidenceForSkill = async (req, res) => {
	try {
		const userId = req.user.id;
		const skillId = req.params.skillId;

		const skill = await Skills.findOne({ _id: skillId, user_id: userId });
		if (!skill) {
			return res.status(404).json({
				success: false,
				error: { code: "NOT_FOUND", message: "Skill not found or access denied" },
			});
		}

		const page = Math.max(parseInt(req.query.page) || 1, 1);
		const limit = Math.min(parseInt(req.query.limit) || 10, 50);
		const skip = (page - 1) * limit;

		const query = { skill_id: skillId, user_id: userId };

		const [evidences, total] = await Promise.all([
			Evidence.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
			Evidence.countDocuments(query),
		]);

		return res.status(200).json({
			success: true,
			data: evidences,
			meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

export const deleteEvidence = async (req, res) => {
	try {
		const userId = req.user.id;
		const evidenceId = req.params.evidenceId;

		const found = await Evidence.findOne({ _id: evidenceId, user_id: userId });
		if (!found) {
			return res.status(404).json({
				success: false,
				error: { code: "NOT_FOUND", message: "Evidence not found or access denied" },
			});
		}

		await found.deleteOne();

		return res.status(200).json({ success: true, message: "Evidence deleted successfully" });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};
