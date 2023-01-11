import { isNumber } from "class-validator";
import { DataSource, ValueTransformer } from "typeorm";
import  fs  from 'fs';
import NodeGeocoder, { GenericOptions } from 'node-geocoder';
import Decimal from 'decimal.js';
import haversine from 'haversine-distance'

const options:GenericOptions = {
  provider :'opencage',
  apiKey:'c2b1091d55b347d980c07fbcf516e046'
}
const geocoder = NodeGeocoder(options);

export interface PointCoordinates {
  latitude: number;
  longitude: number;
}

export const disconnectAndClearDatabase = async (ds: DataSource): Promise<void> => {
  const { entityMetadatas } = ds;

  await Promise.all(entityMetadatas.map(data => ds.query(`truncate table "${data.tableName}" cascade`)));
  await ds.destroy();
};

export const transformArray = async (arrayToBeTransformed: Array<String | number>): Promise<Array<String | number>> => {
 let transformedArray : Array<String|number> = new Array<String|number>;
 transformedArray = arrayToBeTransformed.map(item =>{
  let convertedItemToNumber = +item;
  const isItANumber = isNumber(convertedItemToNumber) ? true : false;
  if(convertedItemToNumber != null && isItANumber) {
    return convertedItemToNumber
  }
  return item;
 });

 return transformedArray;
}

//private interface ErrorReadingFolder : <Error | null>;

export const csvFilesIn = async (path: string) => {
  //  let csvFilesArray : string[] = [] ;
   return new Promise((resolve,reject) =>{
      fs.readdir(path,(errorReadingDirectory: Error, files: string[]) => {
        let csvFiles : string[] = [] ;
        if(errorReadingDirectory){
          reject(errorReadingDirectory) ;
        }
    
        files.forEach((file: string) => {
          // console.log("file: ",file)
          // let suffix = file.split('.').pop(); 
          // console.log('suffix: ',suffix)
          // let isCSV = suffix == 'csv' ? true : false;
          // isCsvFile(file)
          // console.log('isCSV: ',isCSV)
          if(isCsvFile(file)){
            csvFiles.push(file);
          }
        
        });
        // console.log('csvFiles: ',csvFiles)
        resolve(csvFiles) ;
      });
   })
  
//  return csvFilesArray;
}

const isCsvFile = (filename: string) => {
  let suffix = filename.split('.').pop(); 
  return suffix == 'csv';
};

export const containsDigit = (inputText : string) : Boolean => {
  const regex : RegExp = /\d+/g ;
  if(inputText.match(regex)){
    return true;
  }
  return false;
}

export const convertAddressToCoordinates = async (address : string) :Promise<NodeGeocoder.Entry[]> => {
  const res = await geocoder.geocode(address);

  console.log("address:",address);
  console.log("response geocoder: ",res);
  // const {latitude:number, longitude:number} = res;
  
  return res;
}

export const calculateDistanceFromCoordinates = (first:PointCoordinates, second: PointCoordinates): number =>{
  return haversine(first,second);
}

export class DecimalTransformer implements ValueTransformer {
  /**
   * Used to marshal Decimal when writing to the database.
   */
  to(decimal?: Decimal): string | undefined {
    return decimal?.toString();
  }
  /**
   * Used to unmarshal Decimal when reading from the database.
   */
  from(decimal?: string): Decimal | null {
    return decimal ? new Decimal(decimal) : null;
  }
}

export const DecimalToString = (decimals: number = 2) => (decimal?: Decimal) => decimal?.toFixed?.(decimals) || decimal;

