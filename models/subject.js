const Joi = require("joi");
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  displaySequence: {
    type: Number,
    required: true,
  },
  icon: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  iconLib: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 255,
  },
  level: {
    type: String,
    required: true,
    enum: ["elementary", "intermediate", "advanced"],
  },
});

const Subject = mongoose.model("Subject", subjectSchema);

function validateSubject(subject) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    displaySequence: Joi.number().required(),
    icon: Joi.string().min(3).max(255).required(),
    iconLib: Joi.string().min(3).max(255).required(),
    level: Joi.string()
      .valid("elementary", "intermediate", "advanced")
      .required(),
  });

  return schema.validate(subject);
}

exports.Subject = Subject;
exports.validateSubject = validateSubject;
