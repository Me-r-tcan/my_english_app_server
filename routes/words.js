const _ = require("lodash");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Word, validateWord } = require("../models/word");
const { difficultyForProgress } = require("../hardcoded/difficultyAndProgress");

const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const words = await Word.find();
  res.send(words);
});

router.get("/by-subject/:id", [auth, validateObjectId], async (req, res) => {
  const subjectId = new ObjectId(req.params.id);
  const progress = req.query.progress;

  if (!progress)
    return res
      .status(404)
      .send({ errorMessage: "The progress param was not found." });

  const difficulty = difficultyForProgress[progress];

  let options = { subjectId };
  if (difficulty) {
    options["difficulty"] = difficulty;
  }

  const words = await Word.find(options).select("-subjectId");

  res.send(words);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const word = await Word.findById(req.params.id);

  if (!word)
    return res
      .status(404)
      .send({ errorMessage: "The word with the given ID was not found." });

  res.send(word);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validateWord(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  let word = new Word(
    _.pick(req.body, [
      "subjectId",
      "turkishWords",
      "englishWords",
      "difficulty",
    ])
  );
  word = await word.save();

  res.send(word);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validateWord(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  const word = await Word.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, [
      "subjectId",
      "turkishWords",
      "englishWords",
      "difficulty",
    ]),
    {
      new: true,
    }
  );

  if (!word)
    return res
      .status(404)
      .send({ errorMessage: "The word with the given ID was not found." });

  res.send(word);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const word = await Word.findByIdAndRemove(req.params.id);

  if (!word)
    return res
      .status(404)
      .send({ errorMessage: "The word with the given ID was not found." });

  res.send(word);
});

module.exports = router;
