const { execQuery } = require("../models");
const { getQueryPerm } = require("../queries");

function fetchUserByID(username) {
  return getQueryPerm("users", "*", {
    returning: ["username", "name", "avatar_url"],
  })
    .then((perm) => {
      return execQuery({ username: username }, perm);
    })
    .then(({ rows }) => {
      if (rows < 1) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      } else {
        return Promise.resolve(rows[0]);
      }
    });
}
exports.fetchUserByID = fetchUserByID