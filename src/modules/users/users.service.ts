import * as bcrypt from "bcrypt";
import config from "config/config";
import { UnprocessableEntityError } from "errors/errors";
import { DeepPartial, DeleteResult, FindOptionsWhere, Repository, UpdateResult } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { User } from "./entities/user.entity";
import dataSource from "orm/orm.config";
import { FetchUserDto } from "./dto/fetch-user.dto";
import { FetchFarmDto } from "modules/farms/dto/fetch-farm.dto";
import { calculateDistanceFromCoordinates } from "helpers/utils";
// import { UpdateUserDto } from "./dto/update-user.dto";
import {PointCoordinates} from "helpers/utils";
// import { Farm } from "modules/farms/entities/farm.entity";


export class UsersService {
  private readonly usersRepository: Repository<User>;

  constructor() {
    this.usersRepository = dataSource.getRepository(User);
  }

  public async createUser(data: CreateUserDto): Promise<User> {
    const { email, password } = data;   
    const existingUser = await this.findOneBy({ email: email });
    if (existingUser) throw new UnprocessableEntityError("A user for the email already exists");

    const hashedPassword = await this.hashPassword(password);    
    const userData: DeepPartial<User> = { email, hashedPassword };    
    const newUser = this.usersRepository.create(userData);
     console.log(`[Users.service][createUser] newUser: `,newUser);
    return this.usersRepository.save(newUser);
  }

  public async updateUser(data: User): Promise<UpdateResult> {
    const {id, email, address , latitude,longitude } = data;
    let existingUser : User | null  = new User();

    if(email){
       existingUser = await this.findOneBy({ email: email });
    } else if (id){
      existingUser = await this.findOneBy({ id: id });
    }
   
    if (!existingUser) throw new UnprocessableEntityError("User Not Found!");

    existingUser.address = address;
    // existingUser.coordinates = coordinates // not needed
    if(latitude && longitude){
      existingUser.latitude = latitude;
      existingUser.longitude = longitude;
    }
    // existingUser.farms = new Array<Farm>();
    // console.log(`[Users.service][updateUser] updating existingUser: `,existingUser);
   const updatedUserPromise = this.usersRepository.update(existingUser.id, existingUser);
  //  console.log(`[Users.service][updateUser] updatedUserPromise: `,updatedUserPromise);
   return updatedUserPromise;
  }

  public async findOneBy(param: FindOptionsWhere<User>): Promise<User | null> {
    const {id, email} = param;
    if(id){
      return this.usersRepository.findOne({ where:{id:id},relations: ['farms'] });

    }else if(email){
      // return this.usersRepository.findOne({  where:{email:email},relations: ['farms'] });
      return this.usersRepository.findOne({  where:{email:email} });
    }
    return this.usersRepository.findOneBy({ ...param }); 
  }

  public async fetchUserBy(param: FindOptionsWhere<User>): Promise<FetchUserDto | null> {
    const fetchedUser = this.findOneBy(param);
    if(fetchedUser != null){
       let fetchedUserDto: FetchUserDto = await this.convertUserToFetchedUserDto(fetchedUser);
      return fetchedUserDto;
    }
   return null;
  }

  public async hashPassword(password: string, salt_rounds = config.SALT_ROUNDS): Promise<string> {
    const salt = await bcrypt.genSalt(salt_rounds);
    return bcrypt.hash(password, salt);
  }

  private async convertUserToFetchedUserDto(promiseUserToBeConverted: Promise<User | null>) : Promise<FetchUserDto> {
    let fetchedUserDto: FetchUserDto = new FetchUserDto();
    let userToBeConverted: User | null = await promiseUserToBeConverted;
    if(userToBeConverted != null){
      const {id,email,latitude,longitude,address,farms} = userToBeConverted 
      // console.log("fetched email: ",email)
      // console.log("fetched latitude: ",latitude)
      // console.log("fetched longitude: ",longitude);
      // console.log("fetched longitude: ",longitude)
      // console.log("\n fetched farms: ",farms)
      // console.log("\n fetchedUserDto.farms: ",fetchedUserDto.farms)
      fetchedUserDto.address = address;
      fetchedUserDto.id = id;
      fetchedUserDto.email = email;      
      fetchedUserDto.coordinates = {latitude, longitude};  
     
      if(Array.isArray(farms) && farms.length > 0) {
        farms.forEach(farm =>  {
          const fetchedFarmDto:FetchFarmDto = new FetchFarmDto();    
          fetchedFarmDto.address = farm.address;
          fetchedFarmDto.name = farm.name;
          fetchedFarmDto.owner = fetchedUserDto.email;
          fetchedFarmDto.size = farm.size;
          fetchedFarmDto.yield = farm.yield;
          const farmLatitude = farm.latitude;
          const farmLongitude = farm.longitude;

          const farmCoordinate : PointCoordinates = {
            latitude: farmLatitude.toNumber(),
            longitude:farmLongitude.toNumber()
          }

          const fetchUserCoordinates : PointCoordinates ={
            latitude: fetchedUserDto?.coordinates?.latitude?.toNumber() ?? 0,
            longitude:fetchedUserDto?.coordinates?.longitude?.toNumber() ?? 0
          }

          fetchedFarmDto.drivingDistance = calculateDistanceFromCoordinates(farmCoordinate, fetchUserCoordinates)
          fetchedUserDto.farms.push(fetchedFarmDto)
        });
      }
    }
   
    return fetchedUserDto;
  }

  public async deleteAllUsers(): Promise<DeleteResult>{
     return await this.usersRepository.delete({});
  }
}
