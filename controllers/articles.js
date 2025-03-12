const { getQueryPerm } = require("../queries");
const { selectArticleByID } = require("../models/articles");

function fetchArticleByID(id) {
  return getQueryPerm("articles", "*", {
    returning: [
      "author",
      "title",
      "article_id",
      "body",
      "topic",
      "created_at",
      "votes",
      "article_img_url",
    ],
  })
    .then((perm) => {
      return selectArticleByID({ article_id: id }, perm);
    })
    .then(({ rows }) => {
      if (rows < 1) {
        return Promise.reject({ status: 404, msg: "Not Found" });
      } else {
        return Promise.resolve(rows[0]);
      }
    });
}

exports.getAllArticles = (request, response, next) => {
  return getQueryPerm("articles", "*", {
    sort_by: "created_at",
    order: "desc",
    returning: [
      "author",
      "title",
      "article_id",
      "topic",
      "created_at",
      "votes",
      "article_img_url",
    ],
  })
    .then((perm) => {
      return selectArticleByID(request.query, perm);
    })
    .then(({ rows }) => {
      response.status(200).send(rows);
    })
    .catch((err) => {
      next(err);
    });
};

exports.postComment = (request, response, next) => {
  return fetchArticleByID(request.params.id)
    .then(() => {
      console.log(request);
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticleById = (request, response, next) => {
  return fetchArticleByID(request.params.id)
    .then((article) => {
      response.status(200).send(article);
    })
    .catch((err) => {
      next(err);
    });
};
