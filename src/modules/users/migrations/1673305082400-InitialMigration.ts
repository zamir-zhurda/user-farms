import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1673305082400 implements MigrationInterface {
    name = 'InitialMigration1673305082400'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "farm" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "latitude" numeric(10,7) DEFAULT '0', "longitude" numeric(10,7) DEFAULT '0', "size" numeric(10,7) DEFAULT '0', "yield" numeric(10,7) DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "ownerId" uuid, CONSTRAINT "PK_3bf246b27a3b6678dfc0b7a3f64" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "latitude" numeric(10,7) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ADD "longitude" numeric(10,7) DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "access_token" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9"`);
        await queryRunner.query(`ALTER TABLE "access_token" ALTER COLUMN "updatedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "access_token" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "farm" ADD CONSTRAINT "FK_d5f70ea0d7ab61a43bc2a7ce1a6" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "access_token" ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "access_token" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9"`);
        await queryRunner.query(`ALTER TABLE "farm" DROP CONSTRAINT "FK_d5f70ea0d7ab61a43bc2a7ce1a6"`);
        await queryRunner.query(`ALTER TABLE "access_token" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "access_token" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "access_token" ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "latitude"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "address"`);
        await queryRunner.query(`DROP TABLE "farm"`);
    }

}
