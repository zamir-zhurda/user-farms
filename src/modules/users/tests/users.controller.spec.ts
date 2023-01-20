import config from "config/config";
import { Express } from "express";
import { setupServer } from "server/server";
import { disconnectAndClearDatabase } from "helpers/utils";
import http, { Server } from "http";
import ds from "orm/orm.config";
import supertest, { SuperAgentTest } from "supertest";
import { CreateUserDto } from "../dto/create-user.dto";
import { UsersService } from "../users.service";
import { User } from "../entities/user.entity";
import { LoginUserDto } from "modules/auth/dto/login-user.dto";

describe("UsersController", () => {
  let app: Express;
  let agent: SuperAgentTest;
  let server: Server;

  let usersService: UsersService;

  beforeAll(() => {
    app = setupServer();
    server = http.createServer(app).listen(config.APP_PORT);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    await ds.initialize();
    agent = supertest.agent(app);

    usersService = new UsersService();
  });

  afterEach(async () => {
    await disconnectAndClearDatabase(ds);
  });

  describe("POST /users", () => {
    const createUserDto: CreateUserDto = { email: "user@test.com", password: "password" };
    let createdUser:User;
    it("should create new user", async () => {
      const res = await agent.post("/api/v1/users").send(createUserDto);
      createdUser = res.body;
      expect(res.statusCode).toBe(201);
      expect(res.body).toMatchObject({
        id: expect.any(String),
        email: expect.stringContaining(createUserDto.email) as string,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should throw UnprocessableEntityError if user already exists", async () => {
      await usersService.createUser(createUserDto);

      const res = await agent.post("/api/v1/users").send(createUserDto);

      expect(res.statusCode).toBe(422);
      expect(res.body).toMatchObject({
        name: "UnprocessableEntityError",
        message: "A user for the email already exists",
      });
    });

    it("should update user already created", async () => {
      await usersService.createUser(createUserDto);
      const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
      const loginResponse = await agent.post("/api/auth/login").send(loginDto);     
      const { token } = loginResponse.body;
      agent.set('x-access-token',token)

      const updateResponse = await agent.patch("/api/v1/users/update").send({email:createdUser.email, address: "rruga Njazi Meka, 64, 1012, Tirana, Albania"});

      expect(updateResponse.statusCode).toBe(200);
      expect(updateResponse.body).toMatchObject({
        "generatedMaps": [],
        "raw": [],
        "affected": 1
      });
    });


  });
});
