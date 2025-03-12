const { getQueryPerm } = require("../queries")
const { selectArticleByID } = require("../models/articles")

exports.getArticleById = (request,response,next) =>{
    return getQueryPerm('articles',"*",{returning:["author","title","article_id","body","topic","created_at","votes","article_img_url"]})
    .then((perm)=>{
        return selectArticleByID({'article_id':request.params.id},perm)
    })
    .then(({rows}) =>{
        if (rows < 1){
            return Promise.reject({"status": 404,"msg": "Not Found"})
        }else{
            response.status(200).send(rows[0])
        }
    })
    .catch((err)=>{
        next(err)
    })
    
}