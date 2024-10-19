import knex from 'knex';
import profiles from '../knexfile.js';

function withoutDatabaseName(profile) {
  return {
    client: profile.client,
    connection: {
      host: profile.connection.host,
      port: profile.connection.port,
      user: profile.connection.user,
      password: profile.connection.password,
    },
  };
}

async function databaseMustBeCreated(profile) {
  let db;
  try {
    db = knex(profile);
    await db.raw('select 1+1');
    console.log(`ℹ️Database ${profile.connection.database} already exists`);
    return false;
  } catch (error) {
    if (error.message === `database "${profile.connection.database}" does not exist`) return true;

    throw error;
  } finally {
    await db.destroy();
  }
}

async function createDatabase(profile) {
  let db;
  try {
    db = knex(withoutDatabaseName(profile));
    await db.raw(`CREATE DATABASE ${profile.connection.database}`);
    console.log(`✅ Database ${profile.connection.database} created`);
    await db.destroy();
  } finally {
    await db.destroy();
  }
}

async function runMigrations(profile) {
  const db = knex(profile);
  try {
    await db.migrate.latest();
    console.log(`✅ Migrations executed in ${profile.connection.database}`);
  } catch (error) {
    console.error(error);
  } finally {
    await db.destroy();
  }
}

const environment = process.env.NODE_ENV;

console.log(`Setting up DB for env: ${environment}`);

if (!(environment in profiles)) throw new Error(`No profile for ${environment} environment`);

if (await databaseMustBeCreated(profiles[environment])) await createDatabase(profiles[environment]);

await runMigrations(profiles[environment]);
