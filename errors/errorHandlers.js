exports.handlePsqlErrors = (err, req, res, next) => {
  if (err.code === "23505") {
    const userMatch = err.detail.match(/=\(.+\)/g);
    const username = userMatch[0].match(/\w+/g);

    res.status(400).send({ msg: `Username ${username[0]} already exists.` });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: `Bad Request!` });
  }
};
