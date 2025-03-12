const db = require("../db/connection");
const format = require('pg-format')

exports.postCommentToDB = (comment) =>{
    if(Object.keys(comment).length != 3 || !comment.article_id || !comment.username || !comment.body){
        return Promise.reject({"msg":"Bad Request","status":400})
    }
    console.log(format("INSERT INTO comments (article_id,author,body) VALUES %L",[[comment.article_id,comment.username,comment.body]]))
    return db.query(format("INSERT INTO comments (article_id,author,body) VALUES %L RETURNING *",[[comment.article_id,comment.username,comment.body]]))
}

exports.updateVotesOfArticle = (article,newVotes) =>{
    if (typeof newVotes !== "number"){
        return Promise.reject({"msg":"Bad Request","status":400})
    }

    return db.query("UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *",[article.votes + newVotes,article.article_id])
}
