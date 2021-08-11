const Joi = require("joi");
const mongoose = require("mongoose");

const finishedSubjectOptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjectOptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubjectOption",
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const FinishedSubjectOption = mongoose.model(
  "FinishedSubjectOption",
  finishedSubjectOptionSchema
);

function validateFinishedSubjectOption(finishedSubjectOption) {
  const schema = Joi.object({
    // userId auth ile geliyor
    subjectOptionId: Joi.objectId().required(),

    // !!! Difficultyden yola çıkılarak progress bulunacak, o yüzden bu alan doğru
    difficulty: Joi.string().valid("easy", "medium", "hard").required(),
  });

  return schema.validate(finishedSubjectOption);
}

exports.FinishedSubjectOption = FinishedSubjectOption;
exports.validateFinishedSubjectOption = validateFinishedSubjectOption;
