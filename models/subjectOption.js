const Joi = require("joi");
const mongoose = require("mongoose");
const {
  lecture,
  word,
  wordSelect,
  wordWrite,
  sentenceWrite,
} = require("../hardcoded/subjectOptions");

const subjectOptionSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject" },
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
  educationType: {
    type: String,
    required: true,
    enum: ["Lecture", "Word", "WordSelect", "WordWrite", "SentenceWrite"],
  },
});

const SubjectOption = mongoose.model("SubjectOption", subjectOptionSchema);

function validateSubjectOption(subjectOption) {
  const schema = Joi.object({
    subjectId: Joi.objectId().required(),
    name: Joi.string().min(3).max(255).required(),
    displaySequence: Joi.number().required(),
    icon: Joi.string().min(3).max(255).required(),
    iconLib: Joi.string().min(3).max(255).required(),
    educationType: Joi.string()
      .valid("Lecture", "Word", "WordSelect", "WordWrite", "SentenceWrite")
      .required(),
  });

  return schema.validate(subjectOption);
}

const createSubjectOptions = async (subjectId, others) => {
  let subjectOptionLecture = new SubjectOption({
    subjectId,
    ...others,
  });
  subjectOptionLecture = await subjectOptionLecture.save();
};

const createHardcodedSubjectOptions = (subjectId) => {
  createSubjectOptions(subjectId, lecture);
  createSubjectOptions(subjectId, word);
  createSubjectOptions(subjectId, wordSelect);
  createSubjectOptions(subjectId, wordWrite);
  createSubjectOptions(subjectId, sentenceWrite);
};

exports.SubjectOption = SubjectOption;
exports.validate = validateSubjectOption;
exports.createHardcodedSubjectOptions = createHardcodedSubjectOptions;
