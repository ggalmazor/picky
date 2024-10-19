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
  pool: {min: 0, max: 4},
});

const app = new bolt.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: process.env.SLACK_APP_MODE === 'socket',
  appToken: process.env.SLACK_APP_TOKEN,
});

const picky = await Picky.from(db, app);

app.event('message', async (payload) => {
  if (payload.event.bot_profile !== undefined)
    return;

  if (payload.event.channel_type === 'im') return picky.onAppMention(payload, true);

  return picky.onMessage(payload).catch(error => app.logger.error(error.stack));
});

app.event('app_mention', async (payload) => {
  if (payload.event.bot_profile !== undefined)
    return;

  return picky.onAppMention(payload).catch(error => app.logger.error(error.stack));
});

app.event('app_home_opened', async (payload) => {
  return picky.onAppHomeOpened(payload).catch(error => app.logger.error(error.stack));
});

await app.start(process.env.PORT || 3000);
app.logger.info('⚡️ Bolt app is running!');
