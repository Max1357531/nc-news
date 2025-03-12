const exceptionQueries = ['sort_by','order','returning']
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
        query = Object.assign(this.defaultQuery,query)
        console.log(query)
        let string = format("SELECT %I FROM %I",this.defaultQuery.returning,this.tableName)
        Object.keys(query).forEach((key)=>{
            if (!exceptionQueries.includes(key)){
                string += (whereFlag ? " and " : " where " ) + format("%I = %I",key,query[key])
                whereFlag = true
            }
        })
        string += (query.sort_by ? format(" ORDER BY %I ", query.sort_by) + (query.order || "") : "")
        return(string)
    }
}

function getQueryPerm(tableName,allowedQueries={},defaultQuery = {}){
    greenList = {order: ['asc','desc'], sort_by: []}
    const buildDefaultReturn = !defaultQuery.returning
    if (allowedQueries === '*' || buildDefaultReturn){
        return db.query('SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=$1',[tableName])
        .then(({rows})=>{
            for (let colName of rows.map((col) => col.column_name)){
                if (buildDefaultReturn){
                    if (!defaultQuery.returning){
                        defaultQuery.returning = [colName]
                    }
                    else{
                        defaultQuery.returning.push(colName)
                    }
                }
                
                if (allowedQueries === '*'){
                    greenList.sort_by.push(colName)
                    greenList[colName] = ["*"]
                    if (defaultQuery.returning.includes(colName)){
                        if (!greenList.returning){
                            greenList.returning = [colName]
                        }
                        else{
                            greenList.returning.push(colName)
                        }
                    }
                }
            }
            if (allowedQueries === '*') return Promise.resolve(new QueryPerm(tableName,greenList,defaultQuery))
            return Promise.resolve(new QueryPerm(tableName,allowedQueries,defaultQuery))
        })
    }
    else{
        return Promise.resolve(new QueryPerm(tableName,allowedQueries,defaultQuery))
    }
}
exports.getQueryPerm = getQueryPerm;


