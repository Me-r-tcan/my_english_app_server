const auth = require("../middleware/auth");
const { Subject } = require("../models/subject");

const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const router = express.Router();

router.get("/", auth, async (req, res) => {
  const subjects = await Subject.aggregate([
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
      $group: {
        _id: "$level",
        avgProgress: { $avg: "$progress" },
      },
    },
  ]);

  res.send(subjects);
});

module.exports = router;
