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
import { CreateFarmDto } from "modules/farms/dto/create-farm.dto";
import { UpdateFarmDto } from "modules/farms/dto/update-farm.dto";
import { Farm } from "modules/farms/entities/farm.entity";
import Decimal from "decimal.js";


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

    it("should create a farm for a user already created", async () => {
      const userCreated = await usersService.createUser(createUserDto);
      const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
      const loginResponse = await agent.post("/api/auth/login").send(loginDto);     
      const { token } = loginResponse.body;
      agent.set('x-access-token',token)

      const createFarmDto: CreateFarmDto = { 
      name :"test farm",
      address: "30 harmon street, 07035, Lincoln Park, New Jersey",
      size:2,
      yield:1.2
    }

      const createdFarmResponse = await agent.post("/api/v1/users/" + userCreated.id + "/farms/create").send(createFarmDto);
      const createdFarm : Farm = createdFarmResponse.body
         
      expect(createdFarmResponse.statusCode).toBe(201);
      expect(createdFarm.name).toBe(createFarmDto.name);
      expect(createdFarm.address).toBe(createFarmDto.address);
      expect(createdFarm.size.toString()).toBe(createFarmDto.size.toString());
   
    });

    it("should update an existing farm of a user", async () => {
      const userCreated = await usersService.createUser(createUserDto);
      const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
      const loginResponse = await agent.post("/api/auth/login").send(loginDto);     
      const { token } = loginResponse.body;
      agent.set('x-access-token',token)

      const createFarmDto: CreateFarmDto = { 
      name :"test farm",
      address: "30 harmon street, 07035, Lincoln Park, New Jersey",
      size:2,
      yield:1.2
    }

      const updateFarmDto: UpdateFarmDto = {    
        id:"", 
        address: "rruga Qemal Stafa, 10, 1001, Tirana, Albania",
        name: "updated farm name",
        owner: userCreated.email,
        size: new Decimal(2.3),
        yield: new Decimal(1.1),
      }

      const createdFarmResponse = await agent.post("/api/v1/users/" + userCreated.id + "/farms/create").send(createFarmDto);
      const createdFarm : Farm = createdFarmResponse.body
      
      updateFarmDto.id = createdFarm.id;

      const updatedFarmResponse = await agent.patch("/api/v1/users/" + userCreated.id + "/update/farms").send(updateFarmDto);
              
      
      expect(updatedFarmResponse.statusCode).toBe(200);
      expect(updatedFarmResponse.body).toMatchObject({
        "generatedMaps": [],
        "raw": [],
        "affected": 1
      });
   
    });

    it("should delete an existing farm of a user", async () => {
      const userCreated = await usersService.createUser(createUserDto);
      const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
      const loginResponse = await agent.post("/api/auth/login").send(loginDto);     
      const { token } = loginResponse.body;
      agent.set('x-access-token',token)

      const createFarmDto: CreateFarmDto = { 
        name :"test farm",
        address: "rruga Qemal Stafa, 10, 1001, Tirana, Albania",
        size:2,
        yield:1.2
      }

      const createdFarmResponse = await agent.post("/api/v1/users/" + userCreated.id + "/farms/create").send(createFarmDto);
      const createdFarm : Farm = createdFarmResponse.body;
      
      const deletePath: string = `/api/v1/users/${userCreated.id}/delete/farms/${createdFarm.id}`;
      
      const deleteFarmResponse = await agent.delete(deletePath);
      
      expect(deleteFarmResponse.statusCode).toBe(204);
    });

    it("should fetch existing all farms", async () => {
      const userCreated = await usersService.createUser(createUserDto);
      const loginDto: LoginUserDto = { email: "user@test.com", password: "password" };
      const loginResponse = await agent.post("/api/auth/login").send(loginDto);     
      const { token } = loginResponse.body;
      agent.set('x-access-token',token)

      const createFirstFarmDto: CreateFarmDto = { 
        name :"test first farm",
        address: "rruga Qemal Stafa, 10, 1001, Tirana, Albania",
        size:2,
        yield:1.2
      }

      const createSecondFarmDto: CreateFarmDto = { 
        name :"test second farm",
        address: "rruga Njazi Meka, 10, 1012, Tirana, Albania",
        size:4,
        yield:1.1
      }

      await agent.post("/api/v1/users/" + userCreated.id + "/farms/create").send(createFirstFarmDto);
      await agent.post("/api/v1/users/" + userCreated.id + "/farms/create").send(createSecondFarmDto);

      const fetchedFarmsResponse = await agent.get("/api/v1/users/fetch/farms");
    
      const receivedFarms: Farm[] = fetchedFarmsResponse.body;

      //   const farmMatcher = {
      //      id: expect.any(String),
      //      name: expect.any(String),
      //      address: expect.any(String),
      //      owner: expect.any(String) ,
      //      size: expect.any(String),
      //      yield : expect.any(String),
      //      drivingDistance : expect.any(String)
      // }
      // const expectedFarms = new Array(receivedFarms.length).fill(farmMatcher);
      
      expect(fetchedFarmsResponse.statusCode).toBe(200);   
      expect(receivedFarms.length).toBeGreaterThanOrEqual(2);   
      
      receivedFarms.forEach(farm => {
        expect(farm).toHaveProperty('id')
        expect(farm).toHaveProperty('name')
        expect(farm).toHaveProperty('address')
        expect(farm).toHaveProperty('owner')
        expect(farm).toHaveProperty('size')
        expect(farm).toHaveProperty('yield')
        expect(farm).toHaveProperty('drivingDistance')
      });
    });

  });
});
