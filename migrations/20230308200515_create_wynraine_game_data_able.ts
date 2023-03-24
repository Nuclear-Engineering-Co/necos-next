import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  knex.schema
    .createTable('game_data', (table) => {
      table.string('id').notNullable().unique();
      
    })
}


export async function down(knex: Knex): Promise<void> {
}

