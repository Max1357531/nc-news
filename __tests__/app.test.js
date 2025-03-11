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