const endpointsJson = require("../endpoints.json");


const request = require("supertest");
const app = require("../app.js");

const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")



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
      .then(({ body}) => {
        expect(body).toEqual([{"description": "The man, the Mitch, the legend", "slug": "mitch"}, {"description": "Not dogs", "slug": "cats"}, {"description": "what books are made of", "slug": "paper"}]);
      });
    })
    test("400: Responds with a 400 code and error message with invalid query", () => {
      return request(app)
      .get("/api/topics?sort_by=age")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toEqual("Invalid search topic");
      });
    })
  })
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
})