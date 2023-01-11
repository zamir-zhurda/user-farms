import { IsNotEmpty } from "class-validator";

export class CreateFarmDto {

  @IsNotEmpty()
  public name: string;

  @IsNotEmpty()
  public address: string;

  @IsNotEmpty()
  public size: number;

  @IsNotEmpty()
  public yield: number;
}
