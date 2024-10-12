export async function up(knex) {
  await knex.schema.createTable('teams', function (table) {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('url').notNullable();
    table.timestamps();
  });

  await knex.schema.createTable('brains', function (table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('team_id').references("teams.id").notNullable().onDelete('CASCADE');
    table.timestamps();
  });

  await knex.schema.createTable('acronyms', function (table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('brain_id').references('brains.id').notNullable().onDelete('CASCADE');
    table.string('acronym').notNullable();
    table.timestamps();
    table.unique(['brain_id', 'acronym'])
  });

  await knex.schema.createTable('definitions', function (table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('acronym_id').references('acronyms.id').notNullable().onDelete('CASCADE');
    table.string('definition').notNullable();
    table.timestamps();
    table.unique(['acronym_id', 'definition'])
  });
};

export async function down(knex) {
  await knex.schema.dropTable('definitions');
  await knex.schema.dropTable('acronyms');
  await knex.schema.dropTable('brains');
  await knex.schema.dropTable('teams');
};
