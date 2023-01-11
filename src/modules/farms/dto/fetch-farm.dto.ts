import Decimal from "decimal.js"

export class FetchFarmDto {
    public id: string
    public name :string
    public address: string
    public owner :string //(email)
    public size: Decimal
    public yield : Decimal
    public drivingDistance : number
}