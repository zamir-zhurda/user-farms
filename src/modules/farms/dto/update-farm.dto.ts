import { IsNotEmpty } from "class-validator";
import Decimal from "decimal.js";

export class UpdateFarmDto {
    
    @IsNotEmpty()
    public id: string;

    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public address: string;

    @IsNotEmpty()
    public size: Decimal;

    @IsNotEmpty()
    public yield: Decimal;

    @IsNotEmpty()
    public owner : string;
}