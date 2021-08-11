const express = require("express");
const users = require("../routes/users");
const subjects = require("../routes/subjects");
const finishedSubjectsOption = require("../routes/finishedSubjectOption");
const subjectOptions = require("../routes/subjectOptions");
const lecture = require("../routes/lecture");
const myWordLists = require("../routes/myWordLists");
const words = require("../routes/words");
const levels = require("../routes/levels");
const generalInfo = require("../routes/generalInfo");
const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/levels", levels);
  app.use("/api/subjects", subjects);
  app.use("/api/subject-options", subjectOptions);
  app.use("/api/finished-subject-options", finishedSubjectsOption);
  app.use("/api/lecture", lecture);
  app.use("/api/my-word-lists", myWordLists);
  app.use("/api/words", words);
  app.use("/api/general-info", generalInfo);

  app.use(error);
};
