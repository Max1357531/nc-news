const request = require("supertest");

const db = require("../db/connection")
const seed = require("../db/seeds/seed")
const data = require("../db/data/test-data")

const {getQueryPerm} = require('../queries.js');
const { all } = require("../app.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("getQueryPerm", () => {
    test("supplies a query permission with given attributes", () => {
        const tableName = "topics"
        const allowedQueries = {'sort_by': ['description', 'slug'],'order':['desc','asc'],'description':['*']}
        const defaultQuery = {'sort_by': 'slug', 'order': 'asc'}
        getQueryPerm(tableName,allowedQueries,defaultQuery)
        .then((perm)=>{
            expect(perm.tableName).toEqual("topics")
            expect(perm.allowedQueries).toEqual({'sort_by': ['description', 'slug'],'order':['desc','asc'],'description':['*']})
            expect(perm.defaultQuery).toEqual({'sort_by': 'slug', 'order': 'asc'})

        })
    })
    test("gets default queryPermNames when supplied with *", () => {
    })
})
