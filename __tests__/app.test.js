const endpointsJson = require("../endpoints.json");

const request = require("supertest");
const app = require("../app.js");

const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  describe("GET /api/topics", () => {
    test("200: Responds with a list of all topics with no query", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual([
            { description: "The man, the Mitch, the legend", slug: "mitch" },
            { description: "Not dogs", slug: "cats" },
            { description: "what books are made of", slug: "paper" },
          ]);
        });
    });
    test("400: Responds with a 400 code and error message with invalid query", () => {
      return request(app)
        .get("/api/topics?sort_by=age")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toEqual("Invalid search topic");
        });
    });
  });
  describe("GET /api/articles", () => {
    test("200: Responds with all topics sorted by date created", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toEqual(13);
          expect(body[0]).toEqual({
            article_id: 3,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            author: "icellusedkars",
            created_at: "2020-11-03T09:12:00.000Z",
            title: "Eight pug gifs that remind me of mitch",
            topic: "mitch",
            votes: 0,
          });
          expect(body[1]).toEqual({
            article_id: 6,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            author: "icellusedkars",
            created_at: "2020-10-18T01:00:00.000Z",
            title: "A",
            topic: "mitch",
            votes: 0,
          });
        });
    });
    test("200: Responds with all topics sorted by date created with oldest first if prompted", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .expect(200)
        .then(({ body }) => {
          expect(body.length).toEqual(13);
          expect(body[0]).toEqual({
            article_id: 7,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            author: "icellusedkars",
            created_at: "2020-01-07T14:08:00.000Z",
            title: "Z",
            topic: "mitch",
            votes: 0,
          });
          expect(body[1]).toEqual({
            article_id: 11,
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
            author: "icellusedkars",
            created_at: "2020-01-15T22:21:00.000Z",
            title: "Am I a cat?",
            topic: "mitch",
            votes: 0,
          });
        });
    });
    test("400: Responds with an error if prompted an invalid order query", () => {
      return request(app)
        .get("/api/articles?order=ascc")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toEqual("Invalid search term");
        });
    });
    describe("GET /api/articles/:id", () => {
      test("200: Responds with an article if it exists", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual({
              article_id: 1,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              author: "butter_bridge",
              body: "I find this existence challenging",
              created_at: "2020-07-09T20:11:00.000Z",
              title: "Living in the shadow of a great man",
              topic: "mitch",
              votes: 100,
            });
          });
      });
      test("400: Responds with a 400 code and error message with invalid query id", () => {
        return request(app)
          .get("/api/articles/as")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toEqual("Invalid data type");
          });
      });
      test("404: Responds with a 404 code and error message with non existent article", () => {
        return request(app)
          .get("/api/articles/100")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toEqual("Not Found");
          });
      });
      describe("POST /api/articles/:id/comments", () => {
        test("200: Posts a comment to a valid article id", ()=>{
          body = {username:"butter_bridge",body: "good content"}
          return request(app)
            .post("/api/articles/1/comments")
            .send(body)
            .expect(200)
            .then(({ body }) =>{  
              expect(body.comment_id).toEqual(19)
              expect(body.article_id).toEqual(1)
              expect(body.body).toEqual('good content')
              expect(body.votes).toEqual(0)
              expect(body.author).toEqual('butter_bridge')
            })
        })
      })
        test("404: Responds with status 400 and msg not found when article doesn't exist", ()=>{
          body = {username:"butter_bridge",body: "good content"}
          return request(app)
            .post("/api/articles/100/comments")
            .send(body)
            .expect(404)
            .then(({body :{msg}}) =>{  
              expect(msg).toEqual("Not Found")
            })
      
      })
        test("404: Responds with status 400 and msg not found when user doesn't exist", ()=>{
          body = {username:"butter_bridge2",body: "good content"}
          return request(app)
            .post("/api/articles/1/comments")
            .send(body)
            .expect(404)
            .then(({body :{msg}}) =>{  
              expect(msg).toEqual("Not Found")
            })
      })
        test("400: Responds with status 400 and not found when article_id is wrong type", ()=>{
          body = {username:"butter_bridge2",body: "good content"}
          return request(app)
            .post("/api/articles/a/comments")
            .send(body)
            .expect(400)
            .then(({body :{msg}}) =>{  
              expect(msg).toEqual("Invalid data type")
            })
      })
    });
  });
});
describe("app.js", () => {
  test("404: Responds with a 404 error when GET called on undefined endpoint", () => {
    return request(app)
      .get("/nonsense")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Not Found");
      });
  });
});
