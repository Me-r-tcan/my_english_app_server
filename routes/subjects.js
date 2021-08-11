const _ = require("lodash");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Subject, validateSubject } = require("../models/subject");
const { createHardcodedSubjectOptions } = require("../models/subjectOption");

const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const subjects = await Subject.aggregate([
    { $match: { level: req.query.level } },
    {
      $lookup: {
        from: "subjectoptions",
        let: {
          subjectId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$subjectId", "$$subjectId"] }],
              },
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ],
        as: "subjectOptionIds",
      },
    },
    {
      $unwind: "$subjectOptionIds",
    },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        displaySequence: { $first: "$displaySequence" },
        icon: { $first: "$icon" },
        iconLib: { $first: "$iconLib" },
        level: { $first: "$level" },
        subjectOptionIds: { $push: "$subjectOptionIds._id" },
      },
    },
    {
      $lookup: {
        from: "finishedsubjectoptions",
        let: { subjectOptionIds: "$subjectOptionIds" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", ObjectId(req.user._id)] },
                  {
                    $in: ["$subjectOptionId", "$$subjectOptionIds"],
                  },
                ],
              },
            },
          },
          {
            $project: {
              _id: 0,
              progress: 1,
            },
          },
        ],
        as: "finishedSubjectOptions",
      },
    },
    {
      $addFields: {
        progress: {
          $divide: [
            {
              $sum: "$finishedSubjectOptions.progress",
            },
            5,
          ],
        },
      },
    },
    {
      $project: {
        subjectOptionIds: 0,
        finishedSubjectOptions: 0,
      },
    },
    { $sort: { displaySequence: 1 } },
  ]);

  res.send(subjects);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validateSubject(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  let subject = new Subject(
    _.pick(req.body, ["name", "displaySequence", "icon", "iconLib", "level"])
  );
  subject = await subject.save();

  createHardcodedSubjectOptions(subject._id);

  res.send(subject);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validateSubject(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  const subject = await Subject.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ["name", "displaySequence", "icon", "iconLib", "level"]),
    {
      new: true,
    }
  );

  if (!subject)
    return res
      .status(404)
      .send({ errorMessage: "The subject with the given ID was not found." });

  res.send(subject);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const subject = await Subject.findByIdAndRemove(req.params.id);

  if (!subject)
    return res
      .status(404)
      .send({ errorMessage: "The subject with the given ID was not found." });

  res.send(subject);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject)
    return res
      .status(404)
      .send({ errorMessage: "The subject with the given ID was not found." });

  res.send(subject);
});

module.exports = router;
