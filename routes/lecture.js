const _ = require("lodash");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Lecture, validateLecture } = require("../models/lecture");

const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const lectures = await Lecture.find().sort("displaySequence");
  res.send(lectures);
});

router.get(
  "/by-subject-option/:id",
  [auth, validateObjectId],
  async (req, res) => {
    const subjectOptionId = new ObjectId(req.params.id);

    const lectures = await Lecture.find({
      subjectOptionId,
    }).sort("displaySequence");

    if (!lectures)
      return res.status(404).send({
        errorMessage:
          "The lectures with the given Subject Option ID was not found.",
      });

    res.send(lectures);
  }
);

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const lecture = await Lecture.findById(req.params.id).sort("displaySequence");

  if (!lecture)
    return res
      .status(404)
      .send({ errorMessage: "The lecture with the given ID was not found." });

  res.send(lecture);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validateLecture(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  let lecture = new Lecture(
    _.pick(req.body, [
      "subjectOptionId",
      "title",
      "displaySequence",
      "detail",
      "example",
    ])
  );
  lecture = await lecture.save();

  res.send(lecture);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validateLecture(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  const lecture = await Lecture.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ["title", "displaySequence", "detail", "example"]),
    {
      new: true,
    }
  );

  if (!lecture)
    return res
      .status(404)
      .send({ errorMessage: "The lecture with the given ID was not found." });

  res.send(lecture);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const lecture = await Lecture.findByIdAndRemove(req.params.id);

  if (!lecture)
    return res
      .status(404)
      .send({ errorMessage: "The lecture with the given ID was not found." });

  res.send(lecture);
});

module.exports = router;
