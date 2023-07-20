const { insertUser } = require("../models/post.models");

exports.createUsers = (req, res, next) => {
  insertUser(req.body)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      next(err);
    });
};
