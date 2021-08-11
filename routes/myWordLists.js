const _ = require("lodash");
const validateObjectId = require("../middleware/validateObjectId");
const auth = require("../middleware/auth");
const { MyWordList, validateMyWordList } = require("../models/myWordList");

const ObjectId = require("mongodb").ObjectId;
const express = require("express");
const router = express.Router();

const MAX_WORD_COUNT = 100;

router.get("/", auth, async (req, res) => {
  const myWordList = await MyWordList.aggregate([
    { $match: { userId: ObjectId(req.user._id) } },
    {
      $lookup: {
        from: "words",
        foreignField: "_id",
        localField: "wordIds",
        as: "wordIds",
      },
    },
    { $project: { wordIds: 1 } },
  ]);

  const returnMyWordList = myWordList.length ? myWordList[0] : [];

  res.send(returnMyWordList);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateMyWordList(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  const { wordId } = req.body;
  const userId = req.user._id;

  let myWordList;
  myWordList = await MyWordList.findOne({ userId: userId });

  // Kullanıcıya ait veri varsa listesine ekle
  if (myWordList) {
    if (myWordList.wordIds.length >= MAX_WORD_COUNT) {
      return res.status(400).send({
        errorMessage:
          "Maksimum kelimeye ulaşıldı.Daha fazla eklemek için kelimelerim alanından test çözünüz.",
      });
    }

    // Eğer kelime mevcut ise hata mesajı ver, -1 dönücek
    if (myWordList.wordIds.indexOf(wordId) !== -1) {
      return res.status(400).send({
        errorMessage: "Bu kelime zaten eklenmiş.",
      });
    }

    myWordList.wordIds.push(wordId);
  } else {
    // Kullanıcı ilk defa veri oluşturuyorsa
    myWordList = new MyWordList({ userId, wordIds: [wordId] });
  }

  myWordList = await myWordList
    .save()
    .then((myWordList) => myWordList.populate("wordIds").execPopulate());

  res.send(myWordList);
});

// Test çözüldükten sonra array olarak idleri alıp sileceğiz
// router.delete("/:id", [auth, validateObjectId], async (req, res) => {
//   const word = await Word.findByIdAndRemove(req.params.id);

//   if (!word)
//     return res
//       .status(404)
//       .send({ errorMessage: "The word with the given ID was not found." });

//   res.send(word);
// });

module.exports = router;
