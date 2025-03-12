
exports.error404 = (request,response) => {
    response.status(404).send({msg:"Not Found"})
}
exports.customErrorResponse = (err, request,response,next) =>{
    console.log(err,1)
    if (err.msg && err.status){
        response.status(err.status).send({msg:err.msg})
    }
    else{
        next(err)
    }
    
}
exports.errorSQL = (err,request,response,next) =>{
    if (err.code === "22P02"){
        response.status(400).send({msg:"Invalid data type"})
    }else{
        next(err)
    }
}
exports.error500 = (err, request,response,next) => {
    console.log(err,3)
    console.log(err, "<< 500 Error")
    response.status(500).send()
}