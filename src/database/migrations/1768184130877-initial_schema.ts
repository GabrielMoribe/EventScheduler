import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class InitialSchema1768184130877 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'users',
                columns:[
                    {name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid'},
                    {name: 'email', type: 'varchar', length: '255', isUnique: true},
                    {name: 'password', type: 'varchar', length: '255'},
                    {name: 'first_name', type: 'varchar', length: '100'},
                    {name: 'last_name', type: 'varchar', length: '100'},
                    {name: 'role', type: 'enum', enum: ['ADMIN', 'ORGANIZER', 'PARTICIPANT'], default: `'PARTICIPANT'`},
                    {name: 'is_active', type: 'boolean', default: true},
                    {name: 'refresh_token', type: 'varchar', length: '500', isNullable: true},
                    {name: 'created_at', type: 'timestamp', default: 'now()'},
                    {name: 'updated_at', type: 'timestamp', default: 'now()'},
                ]
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('users');
    }

}
