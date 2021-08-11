const _ = require("lodash");
const auth = require("../middleware/auth");
const {
  FinishedSubjectOption,
  validateFinishedSubjectOption,
} = require("../models/FinishedSubjectOption");
const { progressForDifficulty } = require("../hardcoded/difficultyAndProgress");

const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const finishedSubjectOptions = await FinishedSubjectOption.findOne({
    userId: req.user._id,
  }).select("-_id");

  res.send(finishedSubjectOptions);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateFinishedSubjectOption(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  const { difficulty, subjectOptionId } = req.body;
  const userId = req.user._id;

  const userObjectId = new ObjectId(userId);

  const getFinishedSubjectOption = await FinishedSubjectOption.findOne({
    userId: userObjectId,
    subjectOptionId,
  });

  const progress = progressForDifficulty[difficulty];

  // Varsa progressi güncelle
  if (getFinishedSubjectOption) {
    await getFinishedSubjectOption.updateOne({
      progress,
    });
    return res.send();
  }

  let finishedSubjectOption = new FinishedSubjectOption({
    userId: userObjectId,
    subjectOptionId,
    progress,
  });
  finishedSubjectOption = await finishedSubjectOption.save();

  res.send();
});

module.exports = router;
