exports.incorrectPath = (req, res, next) => {
  const error = new Error("Bad Request!");
  error.code = "23502";
  next(error);
};
