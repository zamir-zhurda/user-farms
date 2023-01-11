import Decimal from "decimal.js";
import { FetchFarmDto } from "modules/farms/dto/fetch-farm.dto";

export class FetchUserDto {
    constructor() {
        this.farms = []
    }
    public id: string;
    public email: string;
    public address: string;
    public coordinates: {latitude:Decimal | undefined, longitude:Decimal | undefined}
    public farms: FetchFarmDto [];    
}