const db = require("../../db/connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

// Takes an array of objects of form {key1: a_i, key2: b_i} and returns an object with key(s) of a_i and value(s) of b+i
exports.createLookUp = (objArray) => {
  const returnObject = {}
  if (objArray.length == 0) return returnObject
  const key1 = Object.keys(objArray[0])[0]
  const key2 = Object.keys(objArray[0])[1]
  objArray.forEach((obj) =>{
    returnObject[obj[key1]] = obj[key2]
  })
  return returnObject
}



