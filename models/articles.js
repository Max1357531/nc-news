const db = require("../db/connection");

exports.selectAllArticles = (query, queryPerm) => {
  return queryPerm.greenListQuery(query).then(() => {
    return db.query(queryPerm.completeQueryString(query));
  });
};

exports.selectArticleByID = (query, queryPerm) => {
  return queryPerm.greenListQuery(query).then(() => {
    return db.query(queryPerm.completeQueryString(query));
  });
};
