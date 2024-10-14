export async function up(knex) {
  await knex.schema.createTable('enterprises', function (table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('slack_id').unique();
    table.string('name').notNullable();
    table.timestamps();
  });

  await knex.schema.createTable('teams', function (table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('enterprise_id').references("enterprises.id").nullable().onDelete('CASCADE');
    table.string('slack_id').notNullable();
    table.string('name').notNullable();
    table.string('access_token').nullable();
    table.timestamps();
    table.unique(['enterprise_id', 'slack_id'])
  });

  await knex.schema.createTable('acronyms', function (table) {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('team_id').references('teams.id').notNullable().onDelete('CASCADE');
    table.string('acronym').notNullable();
    table.timestamps();
    table.unique(['team_id', 'acronym'])
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
  await knex.schema.dropTable('teams');
  await knex.schema.dropTable('enterprises');
};
