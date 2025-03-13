const exceptionQueries = ["sort_by", "order", "returning"];
const db = require("./db/connection");
const format = require("pg-format");
const { checkExists } = require("./models");

class QueryPerm {
  constructor(tableName, allowedQueries, defaultQuery,exceptions) {
    this.tableName = tableName;
    this.defaultQuery = defaultQuery;
    this.allowedQueries = allowedQueries;
    this.exceptions = exceptions;
  }

  greenListQuery(query) {
    const toCheck = [];
    for (let queryKey in query) {
      if (!(queryKey in this.allowedQueries)) {
        return Promise.reject({ status: 400, msg: "Invalid search topic" });
      }
      if (
        !(
          this.allowedQueries[queryKey].includes(query[queryKey]) ||
          this.allowedQueries[queryKey].includes("*")
        )
      ) {
        // Checks if value exists if it references the foreign key of another table
        let index_iterator;
        if (
          (index_iterator = this.allowedQueries[queryKey]
            .map((string) => string.substring(0, 2))
            .indexOf("*$")) > -1
        ) {
          const FKInfo = (this.allowedQueries[queryKey][index_iterator]).match(/(?<=\$)[^\$]*/g)
          toCheck.push(checkExists(FKInfo[0],FKInfo[1],query[queryKey]))
          continue;
        }
        toCheck.push(Promise.reject({ status: 400, msg: "Invalid search term" }));
      }
      
      
      
    }
    return Promise.all(toCheck)
    .then(()=>{
      return Promise.resolve()
    });
  }



  completeQueryString(query) {
    query = Object.assign(this.defaultQuery, query);
    let whereFlag = false;
    let string = "SELECT"
    string += " %I.%I,".repeat(this.defaultQuery.returning.length)
    string = format(string.substring(0,string.length-1),
      ...this.defaultQuery.returning.map((returnCol)=>[this.tableName,returnCol]).flat()
    );
    string += this.exceptions.returns;
    string += format(" FROM %I",this.tableName)
    string += this.exceptions.select;
    Object.keys(query).forEach((key) => {
      if (!exceptionQueries.includes(key)) {
        string +=
          (whereFlag ? " and " : " where ") +
          format(" %I.%I = %L ",this.tableName, key, query[key]);
        whereFlag = true;
      }
    });
    string += this.exceptions.where;
    string += query.sort_by
      ? format(" ORDER BY %I ", query.sort_by) + (query.order || "")
      : "";
    
    return string;
  }
}

function getColInfo(tableName) {
  return Promise.all([
    db.query("SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=$1", [
      tableName,
    ]),
    db.query("SELECT * FROM foreign_keys_view WHERE table_name=$1", [
      tableName,
    ]),
  ]).then(([colData, FKData]) => {
    return Promise.resolve([colData.rows, FKData.rows]);
  });
}

function getQueryPerm(tableName, allowedQueries = {}, defaultQuery = {}, exceptions = {"returns":"","select":"","where":""}) {
  greenList = { order: ["asc", "desc"], sort_by: [] };
  const buildDefaultReturn = !defaultQuery.returning;
  if (allowedQueries === "*" || buildDefaultReturn) {
    return getColInfo(tableName).then(([colNames, FKData]) => {
      for (let colName of colNames.map((col) => col.column_name)) {
        if (buildDefaultReturn) {
          if (!defaultQuery.returning) {
            defaultQuery.returning = [colName];
          } else {
            defaultQuery.returning.push(colName);
          }
        }

        if (allowedQueries === "*") {
          greenList.sort_by.push(colName);

          if (
            (indexKey = FKData.map((col) => col.column_name).indexOf(colName)) >
            -1
          ) {
            greenList[colName] = [
              `*$${FKData[indexKey].foreign_table_name}$${FKData[indexKey].foreign_column_name}`,
            ];
          } else greenList[colName] = ["*"];

          if (defaultQuery.returning.includes(colName)) {
            if (!greenList.returning) {
              greenList.returning = [colName];
            } else {
              greenList.returning.push(colName);
            }
          }
        }
      }
      if (allowedQueries === "*")
        return Promise.resolve(
          new QueryPerm(tableName, greenList, defaultQuery,exceptions)
        );
      return Promise.resolve(
        new QueryPerm(tableName, allowedQueries, defaultQuery,exceptions)
      );
    });
  } else {
    return Promise.resolve(
      new QueryPerm(tableName, allowedQueries, defaultQuery,exceptions)
    );
  }
}
exports.getQueryPerm = getQueryPerm;
