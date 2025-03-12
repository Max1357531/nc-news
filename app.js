const express = require('express')
const app = express()
const db = require('./db/connection')
const format = require('pg-format');
const endpoints = require('./endpoints.json')

const{errors:{customErrorResponse,error500,error404,errorSQL},topics} = require ('./controllers');
const { getTopics } = require('./controllers/topics');
const { getArticleById } = require('./controllers/articles');


app.use(express.json())

app.get('/api',(request,response)=>{
    response.status(200).send({endpoints})
})

app.get('/api/topics',getTopics)
app.get('/api/articles/:id',getArticleById)

app.get('*',error404)
app.use(errorSQL)
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