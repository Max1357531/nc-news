const express = require('express')
const app = express()
const db = require('./db/connection')
const format = require('pg-format');
const endpoints = require('./endpoints.json')

const{errors:{customErrorResponse,error500,error404},topics} = require ('./controllers')


app.use(express.json())

app.get('/api',(request,response)=>{
    response.status(200).send({endpoints})
})

app.get('/api/topics',(request,response)=>{
    response.status(200).send({endpoints})
})

app.get('*',error404)
app.use(customErrorResponse)
app.use(error500)

if (!process.env.NODE_ENV){
    app.listen(9090,(err)=>{
        if(err){
            console.log(err)
        }else{
            console.log("Listening on 9090")
        }
    })
}


module.exports = app