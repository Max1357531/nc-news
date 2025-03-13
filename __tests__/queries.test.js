const request = require("supertest");

const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");

const { getQueryPerm, getTableInfo } = require("../queries.js");
const { all } = require("../app.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("getQueryPerm", () => {
  test("supplies a query permission with basic attributes", () => {
    const tableName = "";
    const allowedQueries = {};
    const defaultQuery = {};
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.tableName).toEqual("");
        expect(perm.allowedQueries).toEqual({});
        expect(perm.defaultQuery).toEqual({});
      }
    );
  });
  test("supplies a query permission with given attributes", () => {
    const tableName = "topics";
    const allowedQueries = {
      sort_by: ["description", "slug"],
      order: ["desc", "asc"],
      description: ["*"],
    };
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.tableName).toEqual("topics");
        expect(perm.allowedQueries).toEqual({
          sort_by: ["description", "slug"],
          order: ["desc", "asc"],
          description: ["*"],
        });
        expect(perm.defaultQuery).toEqual({
          sort_by: "slug",
          order: "asc",
          returning: ["slug", "description"],
        });
      }
    );
  });
  test("sets all allowed queries to include all column names when supplied with *", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description", "img_url"],
    };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.tableName).toEqual("topics");
        expect(perm.allowedQueries).toEqual({
          order: ["asc", "desc"],
          sort_by: ["slug", "description", "img_url"],
          slug: ["*"],
          description: ["*"],
          img_url: ["*"],
          returning: ["slug", "description", "img_url"],
        });
        expect(perm.defaultQuery).toEqual({
          sort_by: "slug",
          order: "asc",
          returning: ["slug", "description", "img_url"],
        });
      }
    );
  });
  test("sets all allowed queries to contain all available returning columns in default return when supplied with *", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.tableName).toEqual("topics");
        expect(perm.allowedQueries).toEqual({
          order: ["asc", "desc"],
          sort_by: ["slug", "description", "img_url"],
          slug: ["*"],
          description: ["*"],
          img_url: ["*"],
          returning: ["slug", "description"],
        });
        expect(perm.defaultQuery).toEqual({
          sort_by: "slug",
          order: "asc",
          returning: ["slug", "description"],
        });
      }
    );
  });
  test("sets default query and allowed query to include returning all column names if it does not exist", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.tableName).toEqual("topics");
        expect(perm.allowedQueries).toEqual({
          order: ["asc", "desc"],
          sort_by: ["slug", "description", "img_url"],
          slug: ["*"],
          description: ["*"],
          img_url: ["*"],
          returning: ["slug", "description"],
        });
        expect(perm.defaultQuery).toEqual({
          sort_by: "slug",
          order: "asc",
          returning: ["slug", "description"],
        });
      }
    );
  });

  test("allowed query is set to get foreign key references when provided with *", () => {
    const tableName = "articles";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "title",
      order: "asc",
      returning: ["title", "topic", "author", "body"],
    };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.tableName).toEqual("articles");
        expect(perm.allowedQueries).toEqual({
          article_id: ["*"],
          article_img_url: ["*"],
          author: ["*$users$username"],
          body: ["*"],
          created_at: ["*"],
          order: ["asc", "desc"],
          returning: ["author", "body", "title", "topic"],
          sort_by: [
            "created_at",
            "votes",
            "article_id",
            "author",
            "body",
            "article_img_url",
            "title",
            "topic",
          ],
          title: ["*"],
          topic: ["*$topics$slug"],
          votes: ["*"],
        });
        expect(perm.defaultQuery).toEqual({
          order: "asc",
          returning: ["title", "topic", "author", "body"],
          sort_by: "title",
        });
      }
    );
  });
});

describe("greenListQuery", () => {
  test("accepts empty query", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    const query = {};
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.greenListQuery(query)).resolves.toEqual();
      }
    );
  });
  test("accepts valid query", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    const query = { slug: "hello", sort_by: "slug" };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.greenListQuery(query)).resolves.toEqual();
      }
    );
  });
  test("rejects invalid search topic with correct 400 code and message", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    const query = { slug: "hello", sort_byy: "slug" };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.greenListQuery(query)).rejects.toEqual({
          msg: "Invalid search topic",
          status: 400,
        });
      }
    );
  });
  test("rejects invalid search term with correct 400 code and message", () => {
    const tableName = "topics";
    const allowedQueries = "*";
    const defaultQuery = {
      sort_by: "slug",
      order: "asc",
      returning: ["slug", "description"],
    };
    const query = { slug: "hello", sort_by: "blug" };
    return getQueryPerm(tableName, allowedQueries, defaultQuery).then(
      (perm) => {
        expect(perm.greenListQuery(query)).rejects.toEqual({
          msg: "Invalid search term",
          status: 400,
        });
      }
    );
  });
});

describe("completeQueryString", () => {
  test("completes string for empty query", () => {
    const tableName = "topics";
    const query = {};
    return getQueryPerm(tableName).then((perm) => {
      expect(perm.completeQueryString(query)).toEqual(
        "SELECT slug,description,img_url FROM topics"
      );
    });
  });
  test("completes string for query with a sort_by", () => {
    const tableName = "topics";
    const query = { sort_by: "slug" };
    return getQueryPerm(tableName, "*").then((perm) => {
      expect(perm.completeQueryString(query)).toEqual(
        "SELECT slug,description,img_url FROM topics ORDER BY slug "
      );
    });
  });
  test("completes string for query with a sort_by and order", () => {
    const tableName = "topics";
    const query = { sort_by: "slug", order: "desc" };
    return getQueryPerm(tableName, "*").then((perm) => {
      expect(perm.completeQueryString(query)).toEqual(
        "SELECT slug,description,img_url FROM topics ORDER BY slug desc"
      );
    });
  });
  test("completes string for query returning specific columns", () => {
    const tableName = "topics";
    const query = { sort_by: "slug", order: "desc" };
    return getQueryPerm(tableName, "*", {
      returning: ["slug", "description"],
    }).then((perm) => {
      expect(perm.completeQueryString(query)).toEqual(
        "SELECT slug,description FROM topics ORDER BY slug desc"
      );
    });
  });
});
