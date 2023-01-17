
import { isEmail } from "class-validator";
import { Decimal } from "@prisma/client/runtime";
import { NextFunction, Request, Response } from "express";
import { convertAddressToCoordinates } from "helpers/utils";
import { CreateFarmDto } from "modules/farms/dto/create-farm.dto";
import { UpdateFarmDto } from "modules/farms/dto/update-farm.dto";
import { FarmsService } from "modules/farms/farms.service";
import { DeleteResult, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";

export class UsersController {
  private readonly usersService: UsersService;
  private readonly farmsService: FarmsService;

  constructor() {
    this.usersService = new UsersService();
    this.farmsService = new FarmsService();
  }

  public async create(req: Request, res: Response, next: NextFunction) {
     console.log("[Users.controller][create] req.body: ",req.body);
    try {
      const user = await this.usersService.createUser(req.body as CreateUserDto);
      res.status(201).send(user);
    } catch (error) {
      //console.log("[Users.controller][create] error: ",error);
      next(error);
    }
  }

  public async fetch(req: Request, res:Response,next: NextFunction) {
    try {
      const {id , email} = req.query;   
      let user;
      if(id) {
        user = await this.usersService.fetchUserBy({ id: id.toString() });
        // console.log("email: ",email);
        // console.log("user: ",user)
      } else if(email) {

        user = await this.usersService.fetchUserBy({ email: email.toString() });
        // console.log("user id: ",id)
        // console.log("user: ",user)
      }      
      res.status(200).send(user);
    } catch (error) {
      // console.log("[Users.controller][fetch] error: ",error);
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction) {
    try {
      const {id, email, address} = req.body;
      let fetchedUser;
      if(id) {
        fetchedUser =  await this.usersService.findOneBy({ id: id.toString() });
      } else if(email){
        fetchedUser =  await this.usersService.findOneBy({ email: email.toString() });
        //need to convert the address to coordinates (latitude and longitude)
        const coordinates = await convertAddressToCoordinates(address)
        console.log("[users.controller][update] coordinates: ",coordinates)
        if(Array.isArray(coordinates) && coordinates.length > 0)
        {
          const {latitude,longitude} = coordinates[0]; //I may have more objects but I'm picking the first one!
          if(fetchedUser &&  latitude && longitude){
            const decimalLatitude = new Decimal(String(latitude));
            const decimalLongitude= new Decimal(String(longitude));
            // fetchedUser.latitude = PrismaClient.Decimal(latitude);
            // fetchedUser.longitude = PrismaClient.Decimal(longitude);
            fetchedUser.latitude = decimalLatitude;
            fetchedUser.longitude = decimalLongitude;
            fetchedUser.address = address;
            //fetchedUser.coordinates = {fetchedUser.latitude,fetchedUser.longitude};
            
            const updatedUserResult = await this.usersService.updateUser(fetchedUser);
            console.log("\n updatedUserResult: ",updatedUserResult)
            if(updatedUserResult.affected)
            {
              res.status(200).send(updatedUserResult);

              return;
            }
          
          }     
                    
        }
       
        res.status(404).send("Address not found!");
      }
    } catch (error) {
      console.log("[Users.controller][update] error: ",error);
      next(error);
    }
  }

  public async createFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const createFarmDto: CreateFarmDto = req.body;
    
      let createdFarm;
      if(userId && createFarmDto){
          //let's add it's farm to the db
        createdFarm = await this.farmsService.createFarm(createFarmDto, userId.toString())
      }
    
      res.status(201).send(createdFarm);
    } catch (error) {
      // console.log("[Users.controller][createFarm] error: ",error);
      next(error);
    }
  }

  public async updateFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;    
      const updateFarmDto: UpdateFarmDto = req.body;      
      
      if(updateFarmDto) {
        let updatedFarmResult:UpdateResult;
        if(!isEmail(userId)) {          
           updatedFarmResult = await this.farmsService.updateFarm(updateFarmDto, userId.toString(),undefined);
           if(updatedFarmResult.affected)
           res.status(200).send(updatedFarmResult);
        } else if (isEmail(userId)) {          
          const email = userId;
          updatedFarmResult = await this.farmsService.updateFarm(updateFarmDto, undefined,email.toString());
          if(updatedFarmResult.affected)
          res.status(200).send(updatedFarmResult);
        }          
       
        return;
      }
      res.status(404).send("Missing farmId or data of the farm");
    }catch (error) {
     //console.log("[Users.controller][updateFarm] error: ",error);
      next(error);
    }
  }

  public async deleteFarm(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { farmId } = req.params;

      const email = isEmail(userId) ? userId : undefined;
     
      let deletedFarmResult:DeleteResult;     
     if(email && farmId){
        deletedFarmResult = await this.farmsService.deleteFarm(undefined, email.toString(), farmId);
        if(deletedFarmResult.affected){
          res.status(204).send(deletedFarmResult);
          return;
        }
      } else if(userId && !isEmail(userId) && farmId) {
        deletedFarmResult =  await this.farmsService.deleteFarm(userId,undefined,farmId);
        if(deletedFarmResult.affected){
          res.status(204).send(deletedFarmResult);
          return;
        }
      }    
      res.status(404).send("Some parameters like email, userId or farmId are missing!");
    }catch (error) {
      // console.log("[Users.controller][deleteFarm] error: ",error);
      next(error);
    }
  }

  public async fetchAllFarms(req: Request, res: Response, next: NextFunction) {
    try {
      const {} = req.params;
      const allFarms = await this.farmsService.listAllFarms();      
      res.status(200).send(allFarms);
    }catch (error) {
      // console.log("[Users.controller][listAllFarms] error: ",error);
      next(error);
    }
  }

  public async deleteAllUsers(_: Request, res: Response, next: NextFunction){
    try {
     
      const deleteResult = await this.usersService.deleteAllUsers();      
      res.status(200).send(deleteResult);
    }catch (error) {
      //console.log("[Users.controller][deleteAllUsers] error: ",error);
      next(error);
    }
  }

}
