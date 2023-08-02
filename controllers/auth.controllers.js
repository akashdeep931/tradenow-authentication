exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ msg: "User not authorised." });
  }
};

exports.isLogged = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/authenticated");
  }
};

exports.checkAuthForFailedEndpoint = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.session.messages)
      req.session.messages.splice(0, req.session.messages.length);
    const error = new Error("Bad Request");
    error.code = "23502";
    next(error);
  } else if (req.session.messages && req.session.messages.length > 0) {
    next();
  } else {
    res.status(401).send({ msg: "User not authorised." });
  }
};
