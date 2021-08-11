const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { SubjectOption } = require("../models/subjectOption");
const ObjectId = require("mongodb").ObjectId;

const express = require("express");
const router = express.Router();

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  // Gönderilen Subject idsini SubjectOption tablosunda ara
  const subjectOptions = await SubjectOption.aggregate([
    { $match: { subjectId: ObjectId(req.params.id) } },
    {
      $lookup: {
        from: "finishedsubjectoptions",
        let: { subjectOptionId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$userId", ObjectId(req.user._id)] },
                  { $eq: ["$subjectOptionId", "$$subjectOptionId"] },
                ],
              },
            },
          },
        ],
        as: "finishedSubjectOptions",
      },
    },
    {
      $project: {
        name: 1,
        displaySequence: 1,
        subjectId: 1,
        icon: 1,
        iconLib: 1,
        educationType: 1,
        progress: { $arrayElemAt: ["$finishedSubjectOptions.progress", 0] },
      },
    },
    { $sort: { displaySequence: 1 } },
  ]);

  if (!subjectOptions)
    return res.status(404).send({
      errorMessage:
        "The subject with the given ID was not found in SubjectOptions.",
    });

  res.send(subjectOptions);
});

module.exports = router;
