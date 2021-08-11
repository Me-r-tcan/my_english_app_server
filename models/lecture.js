const Joi = require("joi");
const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema({
  subjectOptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubjectOption",
  },
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
  },
  displaySequence: {
    type: Number,
    required: true,
  },
  detail: {
    type: String,
  },
  example: {
    type: String,
  },
});

const Lecture = mongoose.model("Lecture", lectureSchema);

function validateLecture(lecture) {
  const schema = Joi.object({
    subjectOptionId: Joi.objectId().required(),
    title: Joi.string().min(2).max(255).required(),
    displaySequence: Joi.number().required(),
    detail: Joi.string(),
    example: Joi.string(),
  });

  return schema.validate(lecture);
}

exports.Lecture = Lecture;
exports.validateLecture = validateLecture;
