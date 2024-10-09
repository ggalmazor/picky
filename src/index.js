import bolt from '@slack/bolt';
import Picky from './picky/picky.js';

const app = new bolt.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: process.env.ENVIRONMENT === 'development',
  appToken: process.env.SLACK_APP_TOKEN,
});

const picky = Picky.from(app);

app.event('message', async ({ event, context, say }) => {
  return picky.onMessage(event, context, say);
});

app.event('app_mention', async ({ event }) => {
  return picky.onAppMention(event);
});

await app.start(process.env.PORT || 3000);
console.log('⚡️ Bolt app is running!');
