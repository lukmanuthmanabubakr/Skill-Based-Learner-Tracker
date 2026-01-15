import Evidence from "../modules/users/evidenceLog.schema.js";
import Practice from "../modules/users/practiceLog.schema.js";

export const createEvidence = async (req, res) => {
  try {
    const userId = req.user.id;
    const { practiceLogId } = req.params;
    const { type, uri, note, metadata } = req.body;

    const practice = await Practice.findOne({
      _id: practiceLogId,
      user_id: userId,
    });

    if (!practice) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Practice log not found or access denied",
        },
      });
    }

    const evidence = await Evidence.create({
      practice_log_id: practiceLogId,
      user_id: userId,
      type,
      uri,
      note,
      metadata,
    });

    return res.status(201).json({
      success: true,
      data: evidence,
      meta: {},
    });
  } catch (error) {
    return res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
      },
    });
  }
};

export const getEvidenceForPractice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { practiceLogId } = req.params;

    const practice = await Practice.findOne({
      _id: practiceLogId,
      user_id: userId,
    });

    if (!practice) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Practice log not found or access denied",
        },
      });
    }

    const evidence = await Evidence.find({
      practice_log_id: practiceLogId,
      user_id: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: evidence,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};


export const deleteEvidence = async (req, res) => {
  try {
    const userId = req.user.id;
    const { evidenceId } = req.params;

    const evidence = await Evidence.findOne({
      _id: evidenceId,
      user_id: userId,
    });

    if (!evidence) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Evidence not found or access denied",
        },
      });
    }

    await evidence.deleteOne();

    return res.status(200).json({
      success: true,
      data: null,
      meta: {},
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: error.message,
      },
    });
  }
};

