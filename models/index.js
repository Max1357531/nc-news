const db = require("../db/connection");
const format = require("pg-format");

exports.articles = require("./articles")
exports.comments = require("./comments")
exports.execQuery = (query, queryPerm) => {
    return queryPerm.greenListQuery(query).then(() => {
      return db.query(queryPerm.completeQueryString(query));
    });
  };

exports.checkExists = async (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  const dbOutput = await db.query(queryStr, [value]);
  if (dbOutput.rows.length === 0) {
    return Promise.reject({ status: 404, msg: "Resource not found" });
  }
};