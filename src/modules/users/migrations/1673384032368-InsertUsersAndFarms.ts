import { MigrationInterface, QueryRunner } from "typeorm";
// import { User } from "../entities/user.entity";
import { UsersService } from "../users.service";
// import { Farm } from "modules/farms/entities/farm.entity";
// import { CreateUserDto } from "../dto/create-user.dto";
// import { FarmsService } from "modules/farms/farms.service";
// import { CreateFarmDto } from "modules/farms/dto/create-farm.dto";
// import { convertAddressToCoordinates } from "helpers/utils";
// import Decimal from "decimal.js";

export class InsertUsersAndFarms1673384032368 implements MigrationInterface {
    private readonly usersService: UsersService;
    // private readonly farmsService: FarmsService;

    constructor(){
        this.usersService = new UsersService();
        // this.farmsService = new FarmsService();
    }

    public async up(queryRunner: QueryRunner): Promise<void> {

    //#region old way
    // let firstUserData: CreateUserDto = new CreateUserDto();
    //  firstUserData.email = 'first@email.com';
    //  firstUserData.password = '1234';
    //  const createdUser = await this.createUser(firstUserData);
    //  const resultUpdate = await this.updateUserWithAddress(createdUser,"rruga Njazi Meka,64,1012,Tirana,Albania")
    //  if(resultUpdate.isUpdated){
    //     await this.addFarmsToUser(resultUpdate.userId)
    //  }   
    
    //  let secondUserData: CreateUserDto = new CreateUserDto();
    //  secondUserData.email = 'second@email.com';
    //  secondUserData.password = '1234';
    //  const createSeconddUser = await this.createUser(secondUserData);
    //  const resultSecondUpdate = await this.updateUserWithAddress(createSeconddUser,"rruga e Barrikadave ,6,1015,Tirana,Albania")
    //  if(resultSecondUpdate.isUpdated){
    //     await this.addFarmsToUser(resultSecondUpdate.userId)
    //  }   
    //#endregion
    
    //#region the correct way - but it is not working!
    // await this.insertUsersAndFarms();
    //#endregion

        let hashedPassword = "$2b$10$ntqrRMrRSvQTjOiopqzR5OEPO/RVLqDYvPoUb/yfZBKHn92QdHj..";

        let queryInsertUsersSql = `INSERT INTO "user" ("email", "hashedPassword", "address") 
                        VALUES ('1@email.com','`+hashedPassword+`','rruga Njazi Meka, 64, Tirana, Albania'), 
                        ('2@email.com','`+hashedPassword+`','rruga Irfan Tomini ,10, Tirana, Albania'), 
                        ('3@email.com','`+hashedPassword+`','rruga Dritan Hoxha, 12, Tirana, Albania'), 
                        ('4@email.com','`+hashedPassword+`','rruga Sulejman Delvina, 6, Tirana, Albania'); `;
                        

        let queryInsertFarms = `INSERT INTO "farm" ( "name","address","size", "yield","ownerId" )`+
        `VALUES ('first farm - 1@email.com','via delle Ghiaie,20,Trento,Italy', 1, '1.1',  (SELECT "id" from "user" WHERE "email" = '1@email.com')),`   +
               `('second farm - 1@email.com','via Bresaola,4,Trento,Italy', 2, '2.2',  (SELECT "id" from "user" WHERE "email" = '1@email.com')),`       +
               `('third farm - 1@email.com','via Giovani Caproni,20,Trento,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '1@email.com')),` +
               `('fourth farm - 1@email.com','via delle Scuole,7,Rovereto,Italy',2, '2.2', (SELECT "id" from "user" WHERE "email" = '1@email.com')),`   +
               
               `('first farm - 2@email.com','via delle Ghiaie,10,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '2@email.com')), ` +
               `('second farm - 2@email.com','via Bresaola,7,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '2@email.com')), `     +
               `('third farm - 2@email.com','via Giovani Caproni,4,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '2@email.com')),`+
               `('fourth farm - 2@email.com','via delle Scuole,1,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '2@email.com')), ` +
               
               `('first farm - 3@email.com','via delle Ghiaie,10,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '3@email.com')), ` +
               `('second farm - 3@email.com','via Bresaola,7,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '3@email.com')), `     +
               `('third farm - 3@email.com','via Giovani Caproni,4,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '3@email.com')),`+
               `('fourth farm - 3@email.com','via delle Scuole,1,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '3@email.com')), ` +

               `('first farm - 4@email.com','via delle Ghiaie,10,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '4@email.com')), ` +
               `('second farm - 4@email.com','via Bresaola,7,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '4@email.com')), `     +
               `('third farm - 4@email.com','via Giovani Caproni,4,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '4@email.com')),`+
               `('fourth farm - 4@email.com','via delle Scuole,1,Rovereto,Italy', 2, '2.2', (SELECT "id" from "user" WHERE "email" = '4@email.com')); `  ; 
     
      
        await queryRunner.query(queryInsertUsersSql);  
        await queryRunner.query(queryInsertFarms);
    }

    public async down(_: QueryRunner): Promise<void> {
        await this.usersService.deleteAllUsers();
    }

    //#region FUNCTIONS FOR INSERTING THE DATA IN THE CORRECT WAY!
    // private async createUser(userData: CreateUserDto){
    //     return await this.usersService.createUser(userData);
    // }

    // private async updateUserWithAddress(createdUser: User, address:string){
    //     createdUser.address = address;
    //     const coordinates = await convertAddressToCoordinates(createdUser.address)
    //     if(Array.isArray(coordinates) && coordinates.length > 0)
    //     {
    //         const {latitude,longitude} = coordinates[0];
    //         const decimalLatitude = new Decimal(String(latitude));
    //         const decimalLongitude= new Decimal(String(longitude));
    //         createdUser.latitude = decimalLatitude;
    //         createdUser.longitude = decimalLongitude;
    //     }
    //     const resultUpdate = await this.usersService.updateUser(createdUser);
    //     return {
    //         isUpdated: resultUpdate.affected,
    //         userId:createdUser.id
    //     }
    // }

    // private async addFarmsToUser (userId:string){
        
    //     let firstFarmData: CreateFarmDto = new CreateFarmDto();
    //     let secondFarmData: CreateFarmDto = new CreateFarmDto();
    //     let thirdFarmData: CreateFarmDto = new CreateFarmDto();
    //     let fourthFarmData: CreateFarmDto = new CreateFarmDto();

    //     firstFarmData.name = "first";
    //     firstFarmData.address = "via Caproni ,4, 38100,Trento,Italy ";
    //     firstFarmData.size = 1;
    //     firstFarmData.yield = 1.1

    //     secondFarmData.name = "second";
    //     secondFarmData.address = "via Bresdaola ,4, 38100,Trento,Italy ";
    //     secondFarmData.size = 2;
    //     secondFarmData.yield = 2.2;

    //     thirdFarmData.name = "third";
    //     thirdFarmData.address = "via delle Ghiaie ,20, 38100,Trento,Italy ";
    //     thirdFarmData.size = 3;
    //     thirdFarmData.yield = 3.3;

    //     fourthFarmData.name = "fourth";
    //     fourthFarmData.address = "via Tommaso Gar ,2, 38100,Trento,Italy ";
    //     fourthFarmData.size = 4;
    //     fourthFarmData.yield = 4.4;

    //     await this.farmsService.createFarm(firstFarmData,userId);
    //     await this.farmsService.createFarm(secondFarmData,userId);
    //     await this.farmsService.createFarm(thirdFarmData,userId);
    //     await this.farmsService.createFarm(fourthFarmData,userId);
    // }

    // private async  insertUsersAndFarms() {
    //     for (let i = 0; i < 4; i++) {
    //         let userData: CreateUserDto = new CreateUserDto();
    //         userData.email = (i + 1) + '@email.com';
    //         userData.password = '1234';
    //         const createdUser = await this.createUser(userData);
    //         const resultUpdate = await this.updateUserWithAddress(createdUser, "rruga Njazi Meka,64,1012,Tirana,Albania");
    //         if (resultUpdate.isUpdated) {
    //             await this.addFarmsToUser(resultUpdate.userId);
    //         }
    //     }
    // }
    //#endregion
}
