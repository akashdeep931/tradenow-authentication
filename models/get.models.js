const { readFile } = require("fs/promises");

exports.fetchAllAPIs = () => {
  return readFile(`${__dirname}/../endpoints.json`, "utf-8").then(
    (response) => {
      return JSON.parse(response);
    }
  );
};
