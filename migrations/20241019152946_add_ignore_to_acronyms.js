export async function up(knex) {
  await knex.schema.alterTable('acronyms', function (table) {
    table.boolean('ignored').defaultTo(false).notNullable();
  });
};

export async function down(knex) {
  await knex.schema.alterTable('acronyms', function (table) {
    table.dropColumn('ignored');
  });
};
