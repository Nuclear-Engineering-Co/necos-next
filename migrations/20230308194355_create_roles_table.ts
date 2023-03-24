import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('roles', (table) => {
      table.increments('id');
      table.string('name').notNullable().unique();
      table.integer('position').notNullable().defaultTo(1);
    });
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists('roles');
}

