const Joi = require("joi");
const mongoose = require("mongoose");

const { MAX_LIFE } = require("../hardcoded/generalConstants");

const generalInfoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  life: {
    type: Number,
    required: true,
    min: 0,
    max: MAX_LIFE,
  },
  lifeTimestamp: {
    type: Date,
    required: true,
  },
  diamond: {
    type: Number,
    required: true,
    min: 0,
  },
});

const GeneralInfo = mongoose.model("GeneralInfo", generalInfoSchema);

function validateGeneralInfo(generalInfo) {
  const schema = Joi.object({
    life: Joi.number().min(0).max(MAX_LIFE).required(),
    lifeTimestamp: Joi.date(),
    diamond: Joi.number().min(0),
  });

  return schema.validate(generalInfo);
}

function validateUpdateGeneralInfo(generalInfo) {
  const schema = Joi.object({
    life: Joi.number().max(MAX_LIFE),
    diamond: Joi.number(),
  });

  return schema.validate(generalInfo);
}

const createGeneralInfo = async (userId) => {
  let generalInfo = new GeneralInfo({
    userId,
    life: MAX_LIFE,
    diamond: 500,
    lifeTimestamp: Date.now(),
  });
  generalInfo = await generalInfo.save();
};

exports.GeneralInfo = GeneralInfo;
exports.validateGeneralInfo = validateGeneralInfo;
exports.validateUpdateGeneralInfo = validateUpdateGeneralInfo;
exports.createGeneralInfo = createGeneralInfo;
