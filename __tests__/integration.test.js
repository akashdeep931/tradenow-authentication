const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const createTables = require("../db/createTables");

beforeAll(() => {
  return createTables();
});

afterAll(() => {
  return db.end();
});

describe("POST /register", () => {
  it("201: should create the new user and insert it into the database", () => {
    return request(app)
      .post("/register")
      .send({
        username: "kakashi931",
        name: "Kakashi",
        surname: "Hatake",
        password: "ninjutsu654",
      })
      .expect(201);
  });
  it("201: should ignore unnecessary properties passed by the user and focus on just the useful data", () => {
    return request(app)
      .post("/register")
      .send({
        username: "akash931",
        name: "Akash",
        surname: "Rai",
        password: "softwareengineer931",
        description: "really good at programming",
        age: 21,
      })
      .expect(201)
      .then(() => {
        return db.query(
          `
          SELECT * FROM users
          WHERE username=$1;
          `,
          ["akash931"]
        );
      })
      .then(({ rows }) => {
        expect(rows).toHaveLength(1);

        const insertedUser = rows[0];

        expect(insertedUser).not.toHaveProperty("description");
        expect(insertedUser).not.toHaveProperty("age");

        expect(insertedUser).toHaveProperty("user_id", expect.any(String));
        expect(insertedUser).toHaveProperty("username", "akash931");
        expect(insertedUser).toHaveProperty("name", "Akash");
        expect(insertedUser).toHaveProperty("surname", "Rai");
        expect(insertedUser).toHaveProperty("hash", expect.any(String));
        expect(insertedUser).toHaveProperty("salt", expect.any(String));
      });
  });
  it("400: should return an error when given username already exists in the database", () => {
    return request(app)
      .post("/register")
      .send({
        username: "kakashi931",
        name: "David",
        surname: "Dhillon",
        password: "macintosh123",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toBe("Username kakashi931 already exists.");
      });
  });
  it("400: should return an error when given a malformed body to insert missing the required fields", () => {
    return request(app)
      .post("/register")
      .send({})
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toBe("Bad Request!");
      });
  });
  it("400: should return an error when given a body to insert with incorrect schema and missing required fields", () => {
    return request(app)
      .post("/register")
      .send({
        nothing: "hello world",
        age: 4,
        description: "this shoul give an error",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toBe("Bad Request!");
      });
  });
});
