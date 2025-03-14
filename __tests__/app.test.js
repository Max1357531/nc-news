const endpointsJson = require("../endpoints.json");

const request = require("supertest");
const app = require("../app.js");

const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("/api", () => {
  describe("GET", () => {
    test("200: Responds with an object detailing the documentation for each endpoint", () => {
      return request(app)
        .get("/api")
        .expect(200)
        .then(({ body: { endpoints } }) => {
          expect(endpoints).toEqual(endpointsJson);
        });
    });
  });
  describe("/api/topics", () => {
    describe("GET", () => {
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
  });
  describe("/api/articles", () => {
    describe("GET", () => {
      test("200: Responds with all topics sorted by date created", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toEqual(13);
            delete body[0].created_at // Deleted to remove time zone issues
            expect(body[0]).toEqual({
              article_id: 3,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              author: "icellusedkars",
              comment_count: "2",
              title: "Eight pug gifs that remind me of mitch",
              topic: "mitch",
              votes: 0,
            });
            delete body[1].created_at // Deleted to remove time zone issues
            expect(body[1]).toEqual({
              article_id: 6,
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              comment_count: "1",
              author: "icellusedkars",
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
            expect(body[0].article_id).toEqual(7)
            expect(body[0].article_img_url).toEqual("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
            expect(body[0].author).toEqual("icellusedkars")
            expect(body[0].comment_count).toEqual("0")
            expect(body[0].title).toEqual("Z")
            expect(body[0].topic).toEqual("mitch")

          });
      });
      test("200: Responds with all topics sorted by votes created with most votes first", () => {
        return request(app)
          .get("/api/articles?sort_by=votes&order=desc")
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toEqual(13);
            //Checks each entries vote is less than the last
            expect(body.map((t)=>t.votes).every((curr,index,arr) => !index || arr[index-1] >= curr)).toBe(true)
          });
      });
      test("200: Responds with a article which includes accurate comment count", () => {
        return request(app)
          .get("/api/articles?article_id=1&sort_by=votes&order=desc")
          .expect(200)
          .then(({ body }) => {
            //Checks each entries vote is less than the last
            expect(body[0].comment_count).toEqual("11")
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
      test("200: Responds with a queried list of articles when supplied a valid topic query", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .expect(200)
          .then(({ body }) => {
            delete body[0].created_at; // Deleted to remove time zone issues

            expect(body).toEqual([
              {
                article_id: 5,
                comment_count: "2",
                article_img_url:
                
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                author: "rogersop",
                title: "UNCOVERED: catspiracy to bring down democracy",
                topic: "cats",
                votes: 0,
              },
            ]);
          });
      });
      test("200: Responds with an empty list when supplied with a topic that has no articles", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(({ body }) => {
            expect(body).toEqual([]);
          });
      });
      test("404: Responds with a 404 error if supplied with a topic that does not exist", () => {
        return request(app)
          .get("/api/articles?topic=nonsense")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toEqual("Resource not found");
          });
      });
    });
    describe("/api/articles/:id", () => {
      describe("GET", () => {
        test("200: Responds with an article if it exists", () => {
          return request(app)
            .get("/api/articles/1")
            .expect(200)
            .then(({ body }) => {
              delete body.created_at
              expect(body).toEqual({
                article_id: 1,
                comment_count: "11",
                article_img_url:
                  "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                author: "butter_bridge",
                body: "I find this existence challenging",
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
      });
      describe("PATCH", () => {
        test("200: Updates votes on an article", () => {
          const body = { inc_votes: 10 };
          return request(app)
            .patch("/api/articles/1")
            .send(body)
            .expect(200)
            .then(({ body }) => {
              expect(body.votes).toBe(110);
            });
        });
        test("404: Responds with 404 error if article not found", () => {
          const body = { inc_votes: 10 };
          return request(app)
            .patch("/api/articles/100")
            .send(body)
            .expect(404)
            .then(({ body }) => {
              expect(body.msg).toBe("Not Found");
            });
        });
        test("404: Responds bad request if inc_votes is not a number", () => {
          const body = { inc_votes: "ten" };
          return request(app)
            .patch("/api/articles/1")
            .send(body)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("Bad Request");
            });
        });
        test("400: Responds bad request if inc_votes does not exist in body", () => {
          const body = { votes: "ten" };
          return request(app)
            .patch("/api/articles/1")
            .send(body)
            .expect(400)
            .then(({ body }) => {
              expect(body.msg).toBe("Bad Request");
            });
        });
      });
      describe("/api/articles/:id/comments", () => {
        describe("POST", () => {
          test("200: Posts a comment to a valid article id", () => {
            body = { username: "butter_bridge", body: "good content" };
            return request(app)
              .post("/api/articles/1/comments")
              .send(body)
              .expect(200)
              .then(({ body }) => {
                expect(body.comment_id).toEqual(19);
                expect(body.article_id).toEqual(1);
                expect(body.body).toEqual("good content");
                expect(body.votes).toEqual(0);
                expect(body.author).toEqual("butter_bridge");
              });
          });
          test("404: Responds with status 404 and msg not found when article doesn't exist", () => {
            body = { username: "butter_bridge", body: "good content" };
            return request(app)
              .post("/api/articles/100/comments")
              .send(body)
              .expect(404)
              .then(({ body: { msg } }) => {
                expect(msg).toEqual("Not Found");
              });
          });
          test("404: Responds with status 404 and msg not found when user doesn't exist", () => {
            body = { username: "butter_bridge2", body: "good content" };
            return request(app)
              .post("/api/articles/1/comments")
              .send(body)
              .expect(404)
              .then(({ body: { msg } }) => {
                expect(msg).toEqual("Not Found");
              });
          });
          test("400: Responds with status 400 and not found when article_id is wrong type", () => {
            body = { username: "butter_bridge2", body: "good content" };
            return request(app)
              .post("/api/articles/a/comments")
              .send(body)
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toEqual("Invalid data type");
              });
          });
        });
      });
    });
  });
  describe("/api/comments", () => {
    describe("/api/comments/:id", () => {
      describe("DELETE", () => {
        test("204: Responds with correct status code", () => {
          return request(app)
            .delete("/api/comments/1")
            .expect(204)
            .then(({ body }) => {
              expect(body).toEqual({});
            });
        });
        test("204: Comment is deleted from database", () => {
          let secondComment;
          return request(app)
            .get("/api/comments")
            .expect(200)
            .then(({ body }) => {
              secondComment = body[1];
              return request(app).delete("/api/comments/15").expect(204);
            })
            .then(() => {
              return request(app).get("/api/comments").expect(200);
            })
            .then(({ body }) => {
              expect(body[0]).toEqual(secondComment);
            });
        });
        test("404: Responds with correct status code and message when comment not found", () => {
          return request(app)
            .delete("/api/comments/150")
            .expect(404)
            .then(({ body: { msg } }) => {
              expect(msg).toEqual("Not Found");
            });
        });
        test("400: Responds with correct status code and message when comment id is wrong type", () => {
          return request(app)
            .delete("/api/comments/as")
            .expect(400)
            .then(({ body: { msg } }) => {
              expect(msg).toEqual("Invalid data type");
            });
        });
      });
    });
  });
  describe("/api/users", () => {
    describe("GET", () => {
      test("200: Responds with a list of all users with no query", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then(({ body }) => {
            expect(body.length).toBe(4);
            expect(body[0]).toEqual({
              avatar_url:
                "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
              name: "jonny",
              username: "butter_bridge",
            });
          });
      });
      test("400: Responds with a 400 code and error message with a query", () => {
        return request(app)
          .get("/api/users?sort_by=username")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toEqual("Invalid search topic");
          });
      });
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
