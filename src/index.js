import 'dotenv/config';
import bolt from '@slack/bolt';
import knex from 'knex';
import Picky from './picky/picky.js';

const db = knex({
  client: 'postgresql',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  pool: { min: 0, max: 4 },
  migrations: {
    tableName: 'migrations',
  },
});

const app = new bolt.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: process.env.ENVIRONMENT === 'development',
  appToken: process.env.SLACK_APP_TOKEN,
});

const picky = await Picky.from(db, app);

app.event('message', async ({ event, context, say }) => picky.onMessage(event, context, say));

app.event('app_mention', async ({ event , say}) => picky.onAppMention(event, say));

await app.start(process.env.PORT || 3000);
console.log('⚡️ Bolt app is running!');
