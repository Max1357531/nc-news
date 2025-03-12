const db = require("../db/connection");

exports.articles = require("./articles")
exports.execQuery = (query, queryPerm) => {
    return queryPerm.greenListQuery(query).then(() => {
      return db.query(queryPerm.completeQueryString(query));
    });
  };