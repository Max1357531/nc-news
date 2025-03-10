const endpointsJson = require("../endpoints.json");
/* Set up your test imports here */

/* Set up your beforeEach & afterAll functions here */
const request = require("supertest");
const app = require("../app.js");

// write your tests in here!
const db = require("../db/connection")
const seed = require("../db/seeds/seed.js")
const data = require("../db/data/test-data")



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