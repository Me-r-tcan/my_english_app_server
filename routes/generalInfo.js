const _ = require("lodash");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;

const auth = require("../middleware/auth");
const {
  GeneralInfo,
  validateGeneralInfo,
  validateUpdateGeneralInfo,
} = require("../models/generalInfo");
const increaseLifeByTime = require("../utils/increaseLifeByTime");
const { MAX_LIFE } = require("../hardcoded/generalConstants");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  const generalInfo = await GeneralInfo.findOne({
    userId: req.user._id,
  }).select("-userId");

  if (generalInfo.life < MAX_LIFE) {
    let { newLife, newlifeTimestamp } = increaseLifeByTime(
      generalInfo.life,
      generalInfo.lifeTimestamp
    );

    generalInfo.life += newLife;

    if (newlifeTimestamp) {
      generalInfo.lifeTimestamp = newlifeTimestamp;
    }
    await generalInfo.save();
  }

  res.send(generalInfo);
});

router.put("/", auth, async (req, res) => {
  const { error } = validateUpdateGeneralInfo(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  // get kısmında kullanılan func ekle ve burayı düzenle

  const { diamond, life } = req.body;

  const generalInfo = await GeneralInfo.findOne({
    userId: new ObjectId(req.user._id),
  }).select("-userId");

  if (generalInfo.life + life < 0) {
    return res.send(generalInfo);
  }

  if (diamond) generalInfo.diamond += diamond;

  if (life) {
    if (generalInfo.life + life > MAX_LIFE) {
      generalInfo.life = MAX_LIFE;
    } else {
      generalInfo.life += life;
    }
  }

  if (generalInfo.life < MAX_LIFE) {
    let { newLife, newlifeTimestamp } = increaseLifeByTime(
      generalInfo.life,
      generalInfo.lifeTimestamp
    );

    generalInfo.life += newLife;

    if (newlifeTimestamp) {
      generalInfo.lifeTimestamp = newlifeTimestamp;
    }
  }

  await generalInfo.save();

  res.send(generalInfo);
});

module.exports = router;
