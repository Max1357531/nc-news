const exceptionQueries = ['sort_by','order']
const db = require('./db/connection')
const format = require('pg-format')

class QueryPerm{
    constructor(tableName, allowedQueries,defaultQuery){
        this.tableName = tableName;
        this.defaultQuery = defaultQuery;
        this.allowedQueries = allowedQueries;
    }
    greenListQuery(query){
        for (let queryKey in query){
            if (!(queryKey in this.allowedQueries)){
                return Promise.reject({"status": 400,
                                "msg": "Invalid search topic"})
            }
            if (!(this.allowedQueries[queryKey].includes(query[queryKey])|| this.allowedQueries[queryKey].includes("*"))){
                return Promise.reject({"status": 400,
                                "msg": "Invalid search term"})
            }
        }
        return Promise.resolve()
    
    }

    completeQueryString(query){
        let string = format("SELECT * FROM %I",this.tableName)
        query = Object.assign(this.defaultQuery,query)
        let whereFlag = false
        Object.keys(query).forEach((key)=>{
            if (!exceptionQueries.includes(key)){
                string += (whereFlag ? " and " : " where " ) + format("%I = %I",key,query[key])
                whereFlag = true
            }
        })
        string += (query.order ? format(" ORDER BY %I ", query.sort_by) + (query.order || "") : "")
        return(string)
    }
}

function getQueryPerm(tableName,allowedQueries={},defaultQuery = {}){
    greenList = {order: ['asc','desc'], sort_by: []}
    if (allowedQueries === '*'){
        return db.query('SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=$1',[tableName])
        .then(({rows})=>{
            for (let rowName of rows.map((col) => col.column_name)){
                greenList.sort_by.push(rowName)
                greenList[rowName] = ["*"]
            }
            return Promise.resolve(new QueryPerm(tableName,greenList,defaultQuery))
        })
    }
    else{
        return Promise.resolve(new QueryPerm(tableName,allowedQueries,defaultQuery))
    }
}
exports.getQueryPerm = getQueryPerm;


