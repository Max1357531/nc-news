const db = require("../db/connection")


exports.selectArticleByID = (query,queryPerm) =>{
    return queryPerm.greenListQuery(query)
    .then(()=>{
        return db.query(queryPerm.completeQueryString(query))
    }) 

}