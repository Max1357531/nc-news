const db = require("../connection")
const format = require('pg-format')
const {convertTimestampToDate,createLookUp} = require('./utils');
const { runCLI } = require("jest");
const seed = ({ topicData, userData, articleData, commentData }) => {
  let lookUpArticle;
  return dropAllTables()
  .then(()=>{
  return createTopics()
  }).then(()=>{
  return createUsers()
  }).then(()=>{
  return createArticles()
  }).then(()=>{
  return createComments()
  }).then(()=>{
  return insertTopicsData(topicData)
  }).then(()=>{
  return insertUsersData(userData)
  }).then(()=>{
  return insertArticlesData(articleData)
  }).then((lookUpArticle)=>{
  lookUpArticle = lookUpArticle
  return insertCommentsData(commentData, lookUpArticle)
  }).then(()=>{
  return runTestQueries()
  })
  

};

function dropAllTables(){
  return db.query('DROP TABLE IF EXISTS comments')
  .then(()=>{
    return db.query('DROP TABLE IF EXISTS articles')
  })
  .then(()=>{
    return db.query('DROP TABLE IF EXISTS users')
  })
  .then(()=>{
    return db.query('DROP TABLE IF EXISTS topics')
  })
}

function createTopics(){
  return db.query('CREATE TABLE topics( slug VARCHAR(50) PRIMARY KEY, description VARCHAR(80), img_url VARCHAR(1000))')
  
}

function createUsers(){
  return db.query('CREATE TABLE users( username VARCHAR(50) PRIMARY KEY, name VARCHAR(80), avatar_url VARCHAR(1000))')
}

function createArticles(){
  return db.query('CREATE TABLE articles( article_id SERIAL PRIMARY KEY, title VARCHAR(200), topic VARCHAR(50) REFERENCES topics(slug), author VARCHAR(50) REFERENCES users(username),body TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, votes INT DEFAULT 0, article_img_url VARCHAR(1000))')
}

function createComments(){
  return db.query('CREATE TABLE comments( comment_id SERIAL PRIMARY KEY, article_id INT REFERENCES articles(article_id), body TEXT, votes INT DEFAULT 0, author VARCHAR(50) REFERENCES users(username), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)')
}

function insertTopicsData(topicData){
  return db.query(format(
    'INSERT INTO topics (slug, description, img_url) VALUES %L RETURNING description, slug',
    topicData.map((row) =>{return [row.slug,row.description,row.img_url]})
  ))
}


function insertUsersData(userData){
  return db.query(format(
    'INSERT INTO users (username, name, avatar_url) VALUES %L',
    userData.map((row) =>{return [row.username,row.name,row.avatar_url]})
  ))
}

function insertArticlesData(articleData){
  return db.query(format(
    'INSERT INTO articles (title, topic, author,body,created_at, votes,article_img_url) VALUES %L RETURNING title, article_id',
    articleData.map((row) =>{return [row.title,row.topic,row.author,row.body,convertTimestampToDate({created_at:row.created_at}).created_at,row.votes,row.article_img_url]})
  )).then((articleReturn)=>{
    return Promise.resolve(createLookUp(articleReturn.rows))
  })
}

function insertCommentsData(commentData,articleLookUp){
  return db.query(format(
    'INSERT INTO comments (article_id, body, votes,author, created_at) VALUES %L RETURNING *',
    commentData.map((row) =>{return [articleLookUp[row.article_title],row.body,row.votes,row.author,convertTimestampToDate({created_at:row.created_at}).created_at]})
  ))
}

function titlePrint(string){
  if (string.length > 84){ string = "Title too long"}
  console.log("-".repeat(100))
  console.log("-".repeat(10) + "   " + string + "   " + "-".repeat(84-string.length))
  console.log("-".repeat(100))
}

function runTestQueries(){
  return db.query('SELECT * FROM users')
  .then((result)=>{
    titlePrint('Gets all users')
    console.log(result.rows)
    return db.query("SELECT * FROM articles WHERE topic = 'coding'")
  }).then((result)=>{
    titlePrint('Gets all articles with the topic coding')
    console.log(result.rows)
    return db.query("SELECT * FROM comments WHERE votes < 0")
  }).then((result)=>{
    titlePrint('Gets all comments with votes less than 0')
    console.log(result.rows)
    return db.query("SELECT * FROM topics")
  }).then((result)=>{
    titlePrint('Gets all topics')
    console.log(result.rows)
    return db.query("SELECT * FROM comments WHERE comments.author = 'grumpy19'")
  }).then((result)=>{
    titlePrint('Gets all comments from grumpy19')
    console.log(result.rows)
    return db.query("SELECT * FROM comments WHERE votes > 10")
  }).then((result)=>{
    titlePrint('Gets all comments with more than 10 votes')
    console.log(result.rows)
  })
}

module.exports = seed;
