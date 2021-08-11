const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validateUser } = require("../models/user");
const { createGeneralInfo } = require("../models/generalInfo");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error)
    return res.status(400).send({ errorMessage: error.details[0].message });

  let username = await User.findOne({ username: req.body.username });
  if (username)
    return res.status(400).send({
      errorMessage: "Bu kullanıcı adı mevcut. Başka bir tane alınız.",
    });

  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .send({ errorMessage: "Bu email adresi ile kayıt olunmuş." });

  user = new User(
    _.pick(req.body, ["username", "email", "password", "notification"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  await createGeneralInfo(user._id);

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "username", "email"]));
});

module.exports = router;
