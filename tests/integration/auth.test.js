const { User } = require("../../models/user");
const { Subject } = require("../../models/subject");
const request = require("supertest");

describe("auth middleware", () => {
  beforeEach(() => {
    server = require("../../index");
  });
  afterEach(async () => {
    await Subject.remove({});
    await server.close();
  });

  let token;

  const exec = () => {
    return request(server)
      .post("/api/subjects")
      .set("x-auth-token", token)
      .send({
        name: "subject1",
        displaySequence: 1,
        icon: "icon1",
        iconLib: "iconLib1",
        level: "elementary",
      });
  };

  beforeEach(() => {
    token = new User({
      name: "mertcan",
      email: "mertcan.software@gmail.com",
      password: "test123",
      isAdmin: true,
    }).generateAuthToken();
  });

  it("should return 401 if no token is provided", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    token = "a";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
