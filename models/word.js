const Joi = require("joi");
const mongoose = require("mongoose");

const wordSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
  },
  turkishWords: {
    type: [String],
    required: true,
  },
  englishWords: {
    type: [String],
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["easy", "medium", "hard"],
  },
});

const Word = mongoose.model("Word", wordSchema);

function validateWord(word) {
  const schema = Joi.object({
    subjectId: Joi.objectId().required(),
    turkishWords: Joi.array().items(Joi.string()),
    englishWords: Joi.array().items(Joi.string()),
    difficulty: Joi.string().valid("easy", "medium", "hard").required(),
  });

  return schema.validate(word);
}

exports.Word = Word;
exports.validateWord = validateWord;
