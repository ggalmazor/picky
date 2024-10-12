import knex from 'knex';
import profiles from '../knexfile.js';

function withoutDatabaseName(profile) {
  const config = JSON.parse(JSON.stringify(profile));
  const configConnection = config.connection;
  delete configConnection.database;
  config.connection = configConnection;
  return config;
}

async function createDatabase(profile) {
  const db = knex(withoutDatabaseName(profile));
  try {
    await db.raw(`CREATE DATABASE ${profile.connection.database}`);
    console.log(`✅ Database ${profile.connection.database} created`)
  } catch (error) {
    if (error.message.includes(`database "${profile.connection.database}" already exists`)) {
      console.log(`ℹ️ Database ${profile.connection.database} already exists`);
    } else {
      throw error;
    }
  }
  await db.destroy();
}

async function runMigrations(profile) {
  const db = knex(profile);
  try {
    await db.migrate.latest();
    console.log(`✅ Migrations executed in ${profile.connection.database}`)
  } catch (error) {
    console.error(error);
  }
  await db.destroy();
}

const environment = process.argv[2];

if (!(environment in profiles))
  throw new Error(`No profile for ${environment} environment`);

await createDatabase(profiles[environment]);
await runMigrations(profiles[environment]);
