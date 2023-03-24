import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('configuration', (table) => {
      table.string('guild_id').notNullable().unique();
      table.boolean('verification_enabled').notNullable().defaultTo(false);
      table.json('moderator_roles').notNullable().defaultTo([]);
      table.timestamps();
    })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('configuration');
}

