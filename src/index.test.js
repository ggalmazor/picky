import { v4 as uuid } from 'uuid';
import Picky from '../src/picky/picky.js';
import { mockBootUpContext } from '../test/utils.js';
import { assertThat, hasItem } from 'hamjest';

process.env.NODE_ENV = 'development';

describe('Boot up script (index)', () => {
  const { app, BoltApp, db, knex, picky } = mockBootUpContext();

  beforeEach(async () => {
    jest.restoreAllMocks();
  });

  it('connects to the database', async () => {
    process.env = {
      ...process.env,
      DATABASE_HOST: 'DATABASE_HOST',
      DATABASE_PORT: 'DATABASE_PORT',
      DATABASE_USER: 'DATABASE_USER',
      DATABASE_PASSWORD: 'DATABASE_PASSWORD',
      DATABASE_NAME: 'DATABASE_NAME',
    };

    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(knex).toHaveBeenCalledWith({
      client: 'postgresql',
      connection: {
        host: 'DATABASE_HOST',
        port: 'DATABASE_PORT',
        user: 'DATABASE_USER',
        password: 'DATABASE_PASSWORD',
        database: 'DATABASE_NAME',
      },
      pool: { min: 0, max: 4 },
    });
  });

  it('creates the Slack App', async () => {
    process.env = {
      ...process.env,
      SLACK_SIGNING_SECRET: 'SLACK_SIGNING_SECRET',
      SLACK_BOT_TOKEN: 'SLACK_BOT_TOKEN',
      ENVIRONMENT: 'ENVIRONMENT',
      SLACK_APP_TOKEN: 'SLACK_APP_TOKEN',
    };

    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(BoltApp).toHaveBeenCalledWith({
      signingSecret: 'SLACK_SIGNING_SECRET',
      token: 'SLACK_BOT_TOKEN',
      socketMode: false,
      appToken: 'SLACK_APP_TOKEN',
    });
  });

  describe('when the `ENVIRONMENT` environment variable has `development`', () => {
    it('creates the Slack App in socket mode', async () => {
      process.env = {
        ...process.env,
        SLACK_SIGNING_SECRET: 'SLACK_SIGNING_SECRET',
        SLACK_BOT_TOKEN: 'SLACK_BOT_TOKEN',
        ENVIRONMENT: 'development',
        SLACK_APP_TOKEN: 'SLACK_APP_TOKEN',
      };

      await import(`./../src/index.js?randomizer=${uuid()}`);

      expect(BoltApp).toHaveBeenCalledWith({
        signingSecret: 'SLACK_SIGNING_SECRET',
        token: 'SLACK_BOT_TOKEN',
        socketMode: true,
        appToken: 'SLACK_APP_TOKEN',
      });
    });
  });

  it('creates the Picky instance', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(Picky.from).toHaveBeenCalledWith(db, app);
  });

  it('routes Slack app message events to the Picky onMessage callback', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    const payload = { event: {} };
    app.sendEvent('message', payload);

    expect(picky.onMessage).toHaveBeenCalledWith(payload);
  });

  describe('when a message event comes from an IM channel', () => {
    it('routes the event to the Picky onAppMention callback providing `replyAll: true`', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: { channel_type: 'im' } };
      app.sendEvent('message', payload);

      expect(picky.onAppMention).toHaveBeenCalledWith(payload, true);
    });
  });

  it('routes Slack app mention events to the Picky onAppMention callback', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    const payload = { event: {} };
    app.sendEvent('app_mention', payload);

    expect(picky.onAppMention).toHaveBeenCalledWith(payload);
  });

  it('starts the Slack App', async () => {
    process.env = {
      ...process.env,
      PORT: 'PORT',
    };

    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(app.start).toHaveBeenCalledWith('PORT');
  });

  describe("when there's no `PORT` environment variable", () => {
    it('Starts the Slack App in the default port', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      expect(app.start).toHaveBeenCalledWith(3000);
    });
  });

  it('logs an info message', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    assertThat(app.logger.messages.info, hasItem('⚡️ Bolt app is running!'));
  });
});
