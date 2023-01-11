import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Farm } from "modules/farms/entities/farm.entity";
import Decimal from "decimal.js";
import {  DecimalTransformer } from "helpers/utils";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column({ unique: true })
  public email: string;

  @Column({name: 'hashedPassword'})
  public hashedPassword: string;

  @Column({nullable: true})
  public address: string;

  // @Index({ spatial: true })
  // @Column({
  //   type: 'geography',
  //   spatialFeatureType: 'Point', 
  //   srid: 4326,
  //   nullable: true,
  // })
  // @Column()
  
  public coordinates: {latitude: Decimal | undefined, longitude: Decimal | undefined};

  @Column({ nullable:true, name: 'latitude', type: 'decimal', precision: 10, scale: 7, default: 0.0, transformer: new DecimalTransformer() })
  public latitude: Decimal ;

  @Column({ nullable:true, name: 'longitude', type: 'decimal', precision: 10, scale: 7, default: 0.0, transformer: new DecimalTransformer() }) 
  public longitude: Decimal ;

 
  // @OneToMany(() => Farm, (farm) => farm.owner, {nullable:true ,cascade:true, onDelete: 'CASCADE',  onUpdate:'CASCADE'})
  @OneToMany(() => Farm, (farm) => farm.owner)
  public farms: Farm [];

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
