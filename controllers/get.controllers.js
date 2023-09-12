const { fetchAllAPIs } = require("../models/get.models");

exports.getAuthConfirmation = (req, res) => {
  res.status(200).send({ user: req.user });
};

exports.getLogOutConfirmation = (req, res) => {
  req.session.passport.user = null;
  res.redirect("/authenticated");
};

exports.getAuthFailure = (req, res, next) => {
  if (req.session.messages[0] !== "client fault") {
    req.session.messages.splice(0, req.session.messages.length);
    const error = new Error("Bad Request!");
    error.code = "23502";
    next(error);
  } else {
    req.session.messages.splice(0, req.session.messages.length);
    res.status(404).send({ msg: "Incorrect user or password" });
  }
};

exports.getAllAPIs = (req, res, next) => {
  fetchAllAPIs().then((data) => {
    res.status(200).send({ endpoints: data });
  });
};
