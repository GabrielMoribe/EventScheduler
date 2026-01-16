import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventsParticipantsTable1768432894899 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "event_participants" (
                "event_id" UUID NOT NULL,
                "user_id" UUID NOT NULL,
                CONSTRAINT "PK_event_participants" PRIMARY KEY ("event_id", "user_id"),
                CONSTRAINT "FK_event_participants_event" FOREIGN KEY ("event_id") 
                REFERENCES "events"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_event_participants_user" FOREIGN KEY ("user_id") 
                REFERENCES "users"("id") ON DELETE CASCADE
            )`);

        await queryRunner.query(`
        CREATE INDEX "IDX_event_participants_event" ON "event_participants" ("event_id")
        `);

        await queryRunner.query(`
        CREATE INDEX "IDX_event_participants_user" ON "event_participants" ("user_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_event_participants_user"`);
        await queryRunner.query(`DROP INDEX "IDX_event_participants_event"`);
        await queryRunner.query(`DROP TABLE "event_participants"`);
    }

}
