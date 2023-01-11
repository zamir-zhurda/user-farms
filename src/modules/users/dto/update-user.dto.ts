import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import Decimal from "decimal.js";

export class UpdateUserDto {
  @IsEmail()
//   @IsNotEmpty() // I may have the id instead of email
  public email: string;

//   @IsNotEmpty() //I may have the email instead of id
  public id: string;

  @IsString()
  @IsNotEmpty()
  public address:string

  public coordinates: { latitude: Decimal | undefined, longitude: Decimal | undefined};
}