import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventsTable1768430202382 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "event_status_enum" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED')`);

        await queryRunner.query(`
        CREATE TABLE "events" (
            "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
            "title" VARCHAR(255) NOT NULL,
            "description" TEXT,
            "location" VARCHAR(255),
            "start_date" TIMESTAMP NOT NULL,
            "end_date" TIMESTAMP NOT NULL,
            "max_participants" INT,
            "status" "event_status_enum" NOT NULL DEFAULT 'DRAFT',
            "organizer_id" UUID NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_events_id" PRIMARY KEY ("id"),
            CONSTRAINT "FK_events_organizer" FOREIGN KEY ("organizer_id") 
            REFERENCES "users"("id") ON DELETE CASCADE
        )`);
        
        await queryRunner.query(`CREATE INDEX "IDX_events_status" ON "events" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_events_organizer" ON "events" ("organizer_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_events_start_date" ON "events" ("start_date")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_events_start_date"`);
    await queryRunner.query(`DROP INDEX "IDX_events_organizer"`);
    await queryRunner.query(`DROP INDEX "IDX_events_status"`);
    await queryRunner.query(`DROP TABLE "event_participants"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TYPE "event_status_enum"`);
  }

}
