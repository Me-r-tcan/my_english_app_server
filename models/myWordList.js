const Joi = require("joi");
const mongoose = require("mongoose");

const myWordListSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    wordIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Word" }],
  },
  { timestamps: true }
);

const MyWordList = mongoose.model("MyWordList", myWordListSchema);

function validateMyWordList(myWordList) {
  const schema = Joi.object({
    wordId: Joi.string().required(),
  });

  return schema.validate(myWordList);
}

exports.MyWordList = MyWordList;
exports.validateMyWordList = validateMyWordList;
