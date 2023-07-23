const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const db = require("../db/connection");
const { validatePassword } = require("../utils/passwordUtils");

const verifyCallback = (username, password, done) => {
  db.query(
    `
        SELECT * FROM users
        WHERE username=$1;
        `,
    [username]
  )
    .then(({ rows }) => {
      if (rows.length === 0) return done(null, false, "client fault");

      const user = rows[0];
      const isPasswordCorrect = validatePassword(
        password,
        user.hash,
        user.salt
      );

      if (isPasswordCorrect) return done(null, user);

      return done(null, false, "client fault");
    })
    .catch((err) => {
      done(err);
    });
};

const strategy = new LocalStrategy(verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser((userId, done) => {
  db.query(
    `
    SELECT user_id, username, name, surname FROM users
    WHERE user_id=$1;
    `,
    [userId]
  )
    .then(({ rows }) => {
      done(null, rows[0]);
    })
    .catch((err) => done(err));
});
