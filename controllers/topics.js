const { getQueryPerm } = require("../queries")
const { execQuery } = require("../models")

exports.getTopics = (request,response,next) =>{
    return getQueryPerm('topics',{},{"returning":["slug", "description"]})
    .then((perm)=>{
        return execQuery(request.query,perm)
    })
    .then(({rows}) =>{
        response.status(200).send(rows)
    })
    .catch((err)=>{
        next(err)
    })
    
}