import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('servers', (table) => {
      table.string('job_id').notNullable().unique();
      table.boolean('is_vip').notNullable();
      table.json('players').notNullable().defaultTo([]);
      table.timestamp('last_ping').defaultTo(knex.fn.now(6));

      table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('servers');
}

