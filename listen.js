const app = require("./app.js");
const { PORT = 1050 } = process.env;

app.listen(PORT, (err) => {
  if (err) console.log(`err: ${err}`);
  else console.log(`Listening on port ${PORT}`);
});
