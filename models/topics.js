const db = require("../db/connection")


exports.selectAllTopics = (query,queryPerm) =>{
    return queryPerm.greenListQuery(query)
    .then(()=>{
        return db.query(queryPerm.completeQueryString(query))
    }) 

}