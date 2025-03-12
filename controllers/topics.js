const { getQueryPerm } = require("../queries")
const { selectAllTopics } = require("../models/topics")

exports.getTopics = (request,response,next) =>{
    return getQueryPerm('topics',{},{"returning":["slug", "description"]})
    .then((perm)=>{
        return selectAllTopics(request.query,perm)
    })
    .then(({rows}) =>{
        response.status(200).send(rows)
    })
    .catch((err)=>{
        next(err)
    })
    
}