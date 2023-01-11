import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "modules/users/entities/user.entity";
import Decimal from "decimal.js";
import {  DecimalTransformer } from "helpers/utils";


@Entity("farm")
export class Farm {
  @PrimaryGeneratedColumn("uuid")
  public readonly id: string;

  @Column()
  public name: string;

  @Column()
  public address: string;

//   @Index({ spatial: true })
//   @Column({
//     type: 'geography',
//     spatialFeatureType: 'Point', 
//     srid: 4326,
//     nullable: true,
//   })
//   @Column()
//   public coordinates: Geometry;

  public coordinates: {latitude: number, longitude: number};

  @Column({ nullable:true, name: 'latitude', type: 'decimal', precision: 10, scale: 7, default: 0.0, transformer: new DecimalTransformer() }) 
  public latitude: Decimal;

  @Column({ nullable:true, name: 'longitude', type: 'decimal', precision: 10, scale: 7, default: 0.0, transformer: new DecimalTransformer() }) 
  public longitude: Decimal;

//   @Column()
//   public altitude: number; //this could be avoided

@Column({ nullable:true, name: 'size', type: 'decimal', precision: 10, scale: 7, default: 0.0, transformer: new DecimalTransformer() }) 
  public size: Decimal;

  @Column({ nullable:true, name: 'yield', type: 'decimal', precision: 10, scale: 7, default: 0.0, transformer: new DecimalTransformer() }) 
  public yield: Decimal;

  @ManyToOne(() => User, (user)=> user.farms, { onDelete: 'CASCADE' })
  public owner : User; 

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
}
