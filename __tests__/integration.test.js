const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const createTables = require("../db/createTables");
const endpointsJson = require("../endpoints.json");

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
        description: "this should give an error",
      })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toBe("Bad Request!");
      });
  });
});

describe("POST /login", () => {
  describe("Logging in correctly as a registered user", () => {
    const cookie = [];
    let authEndpoint = "";

    it("302: should authenticate correctly and redirect to the /authenticated endpoint", () => {
      return request(app)
        .post("/login")
        .send({ username: "kakashi931", password: "ninjutsu654" })
        .expect(302)
        .then(({ header }) => {
          cookie.push(...header["set-cookie"]);

          const { location } = header;
          authEndpoint += location;

          expect(location).toBe("/authenticated");
        });
    });
    it("200: /authenticated should response with the user data without confidential data", () => {
      return request(app)
        .get(authEndpoint)
        .set("cookie", cookie)
        .expect(200)
        .then(({ body }) => {
          const { user } = body;

          expect(user).not.toHaveProperty("hash");
          expect(user).not.toHaveProperty("salt");
          expect(user).toHaveProperty("user_id", expect.any(String));
          expect(user).toHaveProperty("username", "kakashi931");
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("surname", expect.any(String));
        });
    });
  });
  describe("Errors requesting /authenticated", () => {
    it("401: /authenticated should response with an unauthorised error when no user is authenticated", () => {
      return request(app)
        .get("/authenticated")
        .expect(401)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("User not authorised.");
        });
    });
  });
  describe("Logging in incorrectly as a registered user", () => {
    const cookie = [];
    let authEndpoint = "";

    it("302: should redirect to the /failed-authentication endpoint if either username and password are wrong", () => {
      return request(app)
        .post("/login")
        .send({ username: "kakashi12093891283", password: "123123123" })
        .expect(302)
        .then(({ header }) => {
          cookie.push(...header["set-cookie"]);

          const { location } = header;
          authEndpoint += location;

          expect(location).toBe("/failed-authentication");
        });
    });
    it("404: /failed-authentication should give an informational error", () => {
      return request(app)
        .get(authEndpoint)
        .set("cookie", cookie)
        .expect(404)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("Incorrect user or password");
        });
    });
  });
  describe("Logging in with malformed body", () => {
    const cookie = [];
    let authEndpoint = "";

    it("302: should redirect to the /failed-authentication endpoint when given a malformed body", () => {
      return request(app)
        .post("/login")
        .send({})
        .expect(302)
        .then(({ header }) => {
          cookie.push(...header["set-cookie"]);

          const { location } = header;
          authEndpoint += location;

          expect(location).toBe("/failed-authentication");
        });
    });
    it("400: /failed-authentication should give a bad request error", () => {
      return request(app)
        .get(authEndpoint)
        .set("cookie", cookie)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("Bad Request!");
        });
    });
  });
  describe("Logging in with with incorrect fields", () => {
    const cookie = [];
    let authEndpoint = "";

    it("302: should redirect to the /failed-authentication endpoint when given a body with incorrect fields", () => {
      return request(app)
        .post("/login")
        .send({ age: 22, role: "senior software engineer" })
        .expect(302)
        .then(({ header }) => {
          cookie.push(...header["set-cookie"]);

          const { location } = header;
          authEndpoint += location;

          expect(location).toBe("/failed-authentication");
        });
    });
    it("400: /failed-authentication should give a bad request error", () => {
      return request(app)
        .get(authEndpoint)
        .set("cookie", cookie)
        .expect(400)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("Bad Request!");
        });
    });
  });
  describe("Errors requesting /failed-authentication", () => {
    it("401: /failed-authentication should response with an unauthorised error when no user is authenticated", () => {
      return request(app)
        .get("/failed-authentication")
        .expect(401)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("User not authorised.");
        });
    });
    describe("/failed-authentication should response with an unauthorised error when requesting after an unsuccessful login", () => {
      const cookie = [];
      let authEndpoint = "";

      it("302: should redirect to the /failed-authentication endpoint if either username and password are wrong", () => {
        return request(app)
          .post("/login")
          .send({ username: "kakashi12093891283", password: "123123123" })
          .expect(302)
          .then(({ header }) => {
            cookie.push(...header["set-cookie"]);

            const { location } = header;
            authEndpoint += location;

            expect(location).toBe("/failed-authentication");
          });
      });
      it("404: /failed-authentication should give an informational error", () => {
        return request(app)
          .get(authEndpoint)
          .set("cookie", cookie)
          .expect(404)
          .then(({ body }) => {
            const { msg } = body;

            expect(msg).toBe("Incorrect user or password");
          });
      });
      it("401: /failed-authentication should response with an unauthorised error after an unsuccessful login", () => {
        return request(app)
          .get(authEndpoint)
          .set("cookie", cookie)
          .expect(401)
          .then(({ body }) => {
            const { msg } = body;

            expect(msg).toBe("User not authorised.");
          });
      });
    });
    describe("Requesting /failed-authentication while being correctly authenticated", () => {
      const cookie = [];
      const failedEndpoint = "/failed-authentication";

      it("302: should authenticate correctly and redirect to the /authenticated endpoint", () => {
        return request(app)
          .post("/login")
          .send({ username: "kakashi931", password: "ninjutsu654" })
          .expect(302)
          .then(({ header }) => {
            cookie.push(...header["set-cookie"]);

            const { location } = header;

            expect(location).toBe("/authenticated");
          });
      });
      it("400: /failed-authentication should return a bad request error", () => {
        return request(app)
          .get(failedEndpoint)
          .set("cookie", cookie)
          .expect(400)
          .then(({ body }) => {
            const { msg } = body;

            expect(msg).toBe("Bad Request!");
          });
      });
    });
  });
});

describe("GET /login", () => {
  describe("Requesting /logout without authenticating", () => {
    const cookie = [];
    let endpoint = "";

    it("302: should redirect to the /authenticated endpoint when no user is authenticated", () => {
      return request(app)
        .get("/logout")
        .expect(302)
        .then(({ header }) => {
          cookie.push(...header["set-cookie"]);

          const { location } = header;

          endpoint += location;

          expect(location).toBe("/authenticated");
        });
    });
    it("401: /authenticated should response with an unauthorised error after requesting /logout with no user authenticated", () => {
      return request(app)
        .get(endpoint)
        .set("cookie", cookie)
        .expect(401)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("User not authorised.");
        });
    });
  });
  describe("Requesting /logout while being authenticated / logged in", () => {
    const cookie = [];

    it("302: /login should authenticate correctly and redirect to the /authenticated endpoint", () => {
      return request(app)
        .post("/login")
        .send({ username: "kakashi931", password: "ninjutsu654" })
        .expect(302)
        .then(({ header }) => {
          cookie.push(...header["set-cookie"]);

          const { location } = header;

          expect(location).toBe("/authenticated");
        });
    });
    it("200: /authenticated should response with the user data without confidential data", () => {
      return request(app)
        .get("/authenticated")
        .set("cookie", cookie)
        .expect(200)
        .then(({ body }) => {
          const { user } = body;

          expect(user).not.toHaveProperty("hash");
          expect(user).not.toHaveProperty("salt");
          expect(user).toHaveProperty("user_id", expect.any(String));
          expect(user).toHaveProperty("username", "kakashi931");
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("surname", expect.any(String));
        });
    });
    it("302: /logout should redirect to the /authenticated endpoint logging out the user", () => {
      return request(app)
        .get("/logout")
        .set("cookie", cookie)
        .expect(302)
        .then(({ header }) => {
          cookie[0] = header["set-cookie"][0];

          const { location } = header;

          expect(location).toBe("/authenticated");
        });
    });
    it("401: /authenticated should response with an unauthorised error after requesting /logout with a logged user", () => {
      return request(app)
        .get("/authenticated")
        .set("cookie", cookie)
        .expect(401)
        .then(({ body }) => {
          const { msg } = body;

          expect(msg).toBe("User not authorised.");
        });
    });
  });
});

describe("GET /api", () => {
  it("200: should return JSON string with all the endpoints details", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;

        expect(endpoints).toEqual(endpointsJson);
      });
  });
  it("400: should return bad request error when requested an incorrect endpoint", () => {
    return request(app)
      .get("/asjhdbjasd")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;

        expect(msg).toBe("Bad Request!");
      });
  });
});
