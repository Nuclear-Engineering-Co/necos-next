import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id');
      table.string('username').notNullable().unique();
      table.string('user_id').notNullable().unique();
      table.string('discord_id').notNullable().unique();

      table.string('password').notNullable();
      table.string('role').notNullable().defaultTo("Player");

      table.timestamps();
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTable('users');
}

