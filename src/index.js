import 'dotenv/config';
import bolt from '@slack/bolt';
import knex from 'knex';
import Picky from './picky/picky.js';
import SlackOAuth from './slack/oauth.js';
import Installer from './slack/installer.js';
import SlackClients from './slack/clients.js';

async function init() {
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
  });

  console.log('✅ Connected to the database');

  const app = new bolt.App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN,
    socketMode: process.env.SLACK_APP_MODE === 'socket',
    appToken: process.env.SLACK_APP_TOKEN,
    logLevel: process.env.LOG_LEVEL,
  });
  console.log('✅ Slack App created');

  const clients = SlackClients.build(db, app.logger);
  console.log('✅ Slack Clients created');

  const slackOAuth = new SlackOAuth(
    app.client,
    {
      id: process.env.CLIENT_ID,
      secret: process.env.CLIENT_SECRET,
    },
    app.logger,
  );
  console.log('✅ Slack OAuth created');

  const installer = new Installer(db, clients);
  console.log('✅ Slack App Installer created');

  const picky = await Picky.from(db, app, clients);
  console.log('🤖 Picky created');

  app.event('message', async (payload) => {
    if (payload.event.bot_profile !== undefined) return;

    if (payload.event.channel_type === 'im') return picky.onAppMention(payload, true);

    return picky.onMessage(payload).catch((error) => app.logger.error(error.stack));
  });
  console.log('👂message listener registered');

  app.event('app_mention', async (payload) => {
    if (payload.event.bot_profile !== undefined) return;

    return picky.onAppMention(payload).catch((error) => app.logger.error(error.stack));
  });
  console.log('👂app mention listener registered');

  app.event('app_home_opened', async (payload) => {
    return picky.onAppHomeOpened(payload).catch((error) => app.logger.error(error.stack));
  });
  console.log('👂app home opened listener registered');

  app.event('app_uninstalled', async (payload) => {
    await installer.uninstall(payload.team_id, payload.enterprise_id).catch((error) => app.logger.error(error.stack));

    app.logger.info(`⚠️ Team ${payload.team_id} uninstalled`);
  });
  console.log('👂app uninstalled listener registered');

  app.receiver.routes = {
    '/oauth': {
      GET: async (req, res) => {
        const url = new URL(`https://example.com${req.url}`);
        const code = url.searchParams.get('code');

        const { team, enterprise, accessToken } = await slackOAuth.access(code);

        const redirectUrl = await installer.completeInstallation(team, enterprise, accessToken);
        app.logger.info(`🎉 Team ${team.id} installed`);

        res.writeHead(302, { Location: redirectUrl });
        res.end(`Success! You will now be redirected to ${redirectUrl}`);
      },
    },
    '/install': {
      GET: async (req, res) => {
        res.writeHead(302, {
          Location:
            'https://slack.com/oauth/v2/authorize?client_id=7828417850918.7820563959399&scope=app_mentions:read,channels:history,chat:write,im:history,im:write,reactions:write,team:read&user_scope=',
        });
        res.end('');
      },
    },
  };
  console.log('✅ custom web routes added');

  return app;
}

async function start(app) {
  await app.start(process.env.PORT || 3000);
  console.log('🤖 Picky is running! ⚡️');
}

const app = await init().catch((error) => console.error(error.stack));
start(app).catch((error) => console.error(error.stack));
