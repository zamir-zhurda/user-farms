import { Farm } from "./entities/farm.entity";
import dataSource from "orm/orm.config";
import { DeepPartial, DeleteResult, Repository, UpdateResult } from "typeorm";
import { CreateFarmDto } from "./dto/create-farm.dto";
import { User } from "modules/users/entities/user.entity";
import { UnprocessableEntityError } from "errors/errors";
import { calculateDistanceFromCoordinates, convertAddressToCoordinates, PointCoordinates } from "helpers/utils";
import Decimal from "decimal.js";
import { FetchFarmDto } from "./dto/fetch-farm.dto";
import { UpdateFarmDto } from "./dto/update-farm.dto";

export class FarmsService {
    private readonly farmsRepository: Repository<Farm>;
    private readonly usersRepository: Repository<User>;

    constructor() {
      this.farmsRepository = dataSource.getRepository(Farm);
      this.usersRepository = dataSource.getRepository(User);
    }

    public async createFarm(data: CreateFarmDto, userId: string): Promise<Farm>
   {
    let existingOwner;
    if(userId){
        existingOwner = await this.usersRepository.findOneBy({ id: userId });
    }
    if(existingOwner){
        //1) first let's fetch farm's coordinates from its address
        const coordinates = await convertAddressToCoordinates(data.address);
        if(Array.isArray(coordinates) && coordinates.length > 0)
        {
            const {latitude,longitude} = coordinates[0]; //I may have more objects but I'm picking the first one!
            const decimalLatitude = new Decimal(String(latitude));
            const decimalLongitude= new Decimal(String(longitude));
            const farmData: DeepPartial<Farm> = { ...data, latitude:decimalLatitude, longitude:decimalLongitude, owner:existingOwner };
            const newFarm = this.farmsRepository.create(farmData);
            return this.farmsRepository.save(newFarm);
        }
        throw new UnprocessableEntityError("Address not found!");
      
    }
    throw new UnprocessableEntityError("User not found!");
   }

   public async updateFarm(data: UpdateFarmDto, userId: string | undefined, email: string | undefined): Promise<UpdateResult> {
    const {id, name, address , size, yield: income , owner} = data;
    let existingUser : User | null  = new User();
    let farmOwner : User | null  = new User();
    let existingFarm : Farm | null  = new Farm();

    if(userId) {
        existingUser = await this.usersRepository.findOne({ where: {id: userId},relations: ['farms'] });
    } else if(email) {
        existingUser = await this.usersRepository.findOne({ where: { email: email },relations: ['farms'] });
    } else {
        throw new UnprocessableEntityError("User Not Found!");
    }
    
    if(owner){
        farmOwner = await this.usersRepository.findOne({ where:{email:owner},relations: ['farms'] });
    } else{
        throw new UnprocessableEntityError("Owner Not Found!");
    }
    // console.log("userId: ",userId )
    // console.log("email: ",email )
    // console.log("===============================================")
    // console.log("existingUser",existingUser )
    // console.log("===============================================")
    // console.log("existingUser?.id",existingUser?.id )
    // console.log("farmOwner?.id",farmOwner?.id)
    // console.log("===============================================")
    // console.log("existingUser?.email",existingUser?.email)
    // console.log("farmOwner?.email",farmOwner?.email)
    // console.log("===============================================")
    // console.log("existingUser?.id == farmOwner?.id",existingUser?.id == farmOwner?.id)
    // console.log("existingUser?.email == farmOwner?.email",existingUser?.email == farmOwner?.email)
    // console.log("===============================================")
    if(existingUser?.id == farmOwner?.id && existingUser?.email == farmOwner?.email )
    {
        //the user calling is the same as the owner of the farm. We can proceed with the update

        existingFarm = await this.farmsRepository.findOne({ where:{id:id},relations: ['owner'] });

        if (!existingFarm) throw new UnprocessableEntityError("Farm Not Found!");
      
        //1) first let's fetch farm's coordinates from its address
        const coordinates = await convertAddressToCoordinates(address);
        
        if(Array.isArray(coordinates) && coordinates.length > 0)
        {
            const {latitude,longitude} = coordinates[0]; //I may have more objects but I'm picking the first one!
            const decimalLatitude = new Decimal(String(latitude));
            const decimalLongitude= new Decimal(String(longitude));
            existingFarm.latitude = decimalLatitude;
            existingFarm.longitude = decimalLongitude;
        }
        existingFarm.name = name;
        existingFarm.address = address;
        existingFarm.size = size;
        existingFarm.yield = income;

        const updatedFarmPromise = this.farmsRepository.update(existingFarm.id, existingFarm);
        return updatedFarmPromise;

    } else {
        throw new UnprocessableEntityError("this user is not the owner of the farm!");
    }

   }

   public async deleteFarm(userId:string | undefined, email:string | undefined, farmId:string): Promise<DeleteResult> {
    if(farmId){
       const existingFarm = await this.farmsRepository.findOne({ where:{id:farmId},relations: ['owner'] });
    //    console.log("[deleteFarm] existingFarm: ",existingFarm);
    //    console.log("[deleteFarm] userId: ",userId);
    //    console.log("[deleteFarm] email: ",email);
    //    console.log("[deleteFarm] existingFarm.owner.email == email: ",existingFarm?.owner.email == email);
    //    let deletedFarmResult : DeleteResult;
       if(existingFarm && userId && existingFarm.owner.id == userId){
        //  const farmOwner = await this.usersRepository.findOne({ where:{id:userId},relations: ['farms'] });
          return await this.farmsRepository.delete({id:farmId});
       } else if(existingFarm && email && existingFarm.owner.email == email){
       
         return await this.farmsRepository.delete({id:farmId});
       }else{
        throw new UnprocessableEntityError("This person is not the farm's owner or it doesn't exist");
       }
    }else{
        throw new UnprocessableEntityError("Missing farm id!");
    }
   }

   public async listAllFarms():Promise<FetchFarmDto[] | null> {
    // const fetchedFarms = this.farmsRepository.find({relations: ['owner'] });
    const fetchedFarms = this.farmsRepository.find({order:{ name: "ASC", createdAt : "ASC"},relations: ['owner'] });
   
    const fetchedFarmDtos = await this.convertFarmsToFetchedFarmsDto(fetchedFarms)
    // console.log("====================================")
    // console.log("fetchedFarms:",await fetchedFarms)
    // console.log("====================================")
    return fetchedFarmDtos;
   }

   private async convertFarmsToFetchedFarmsDto(promiseFarmsToBeConverted: Promise<Array<Farm> | null>) : Promise<Array<FetchFarmDto>> {
    let fetchedFarmDtos: FetchFarmDto[] = [];
    let farmsToBeConverted: Array<Farm> | null = await promiseFarmsToBeConverted;

    if(Array.isArray(farmsToBeConverted) && farmsToBeConverted.length> 0){
        farmsToBeConverted.forEach(farm =>{
           let fetchedFarmDto : FetchFarmDto = new FetchFarmDto();
           fetchedFarmDto.id = farm.id
           fetchedFarmDto.address = farm.address;
           fetchedFarmDto.name = farm.name;         
           fetchedFarmDto.owner = farm.owner.email;
           fetchedFarmDto.size = farm.size;
           fetchedFarmDto.yield = farm.yield;

           const farmCoordinate : PointCoordinates = {
            latitude: farm.latitude.toNumber(),
            longitude:farm.longitude.toNumber()
          }
  
          const fetchUserCoordinates : PointCoordinates ={
            latitude: farm.owner.latitude.toNumber(),
            longitude: farm.owner.longitude.toNumber()
          }

           fetchedFarmDto.drivingDistance = calculateDistanceFromCoordinates(farmCoordinate,fetchUserCoordinates);
           fetchedFarmDtos.push(fetchedFarmDto);
        });
    }
    const sortedFetchedFarmDtos = fetchedFarmDtos.sort((firstFarm,secondFarm) =>  firstFarm.drivingDistance - secondFarm.drivingDistance );
    // console.log("\n ====================================")
    // console.log("sortedFetchedFarmDtos: ",sortedFetchedFarmDtos)
    // console.log("====================================")
    return sortedFetchedFarmDtos
   }
}