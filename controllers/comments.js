const { getQueryPerm } = require("../queries");
const {
    execQuery,
    comments: {deleteCommentFromDB}
  } = require("../models");


function fetchCommentByID(id) {
    return getQueryPerm("comments", "*", {
      returning: [
        "comment_id",
        "article_id",
        "body",
        "votes",
        "author",
        "created_at"
      ],
    })
      .then((perm) => {
        return execQuery({ comment_id: id }, perm);
      })
      .then(({ rows }) => {
        if (rows < 1) {
          return Promise.reject({ status: 404, msg: "Not Found" });
        } else {
          return Promise.resolve(rows[0]);
        }
      });
  }

exports.getAllComments = (request, response, next) => {
  return getQueryPerm("comments", "*", {
    sort_by: "created_at",
    order: "desc"
  })
    .then((perm) => {
      return execQuery(request.query, perm);
    })
    .then(({ rows }) => {
      response.status(200).send(rows);
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteComment = (request, response, next) => {

    return fetchCommentByID(request.params.id)
    .then(()=>{
        return deleteCommentFromDB(request.params.id)
    })
    .then(()=>{
        response.status(204).send()
    })
    .catch((err) => {
      next(err);
    });
}
exports.fetchCommentByID = fetchCommentByID