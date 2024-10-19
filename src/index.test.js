import {v4 as uuid} from 'uuid';
import Picky from '../src/picky/picky.js';
import {mockBootUpContext} from '../test/utils.js';
import {allOf, assertThat, containsString, hasItem, startsWith} from 'hamjest';

async function withEnv(envEntries, block) {
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    ...envEntries
  }

  await block();

  process.env = originalEnv;
}

describe('Boot up script (index)', () => {
  const { app, BoltApp, db, knex, logger, picky } = mockBootUpContext();

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe("sets up Picky's dependencies", () => {
    it('connects to the database', async () => {
      await withEnv({
        DATABASE_HOST: 'DATABASE_HOST',
        DATABASE_PORT: 'DATABASE_PORT',
        DATABASE_USER: 'DATABASE_USER',
        DATABASE_PASSWORD: 'DATABASE_PASSWORD',
        DATABASE_NAME: 'DATABASE_NAME',
      }, async () => {
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
          pool: {min: 0, max: 4},
        });
      });
    });

    it('creates the Slack App', async () => {
      await withEnv({
        SLACK_SIGNING_SECRET: 'SLACK_SIGNING_SECRET',
        SLACK_BOT_TOKEN: 'SLACK_BOT_TOKEN',
        SLACK_APP_TOKEN: 'SLACK_APP_TOKEN',
        SLACK_APP_MODE: 'https',
      }, async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        expect(BoltApp).toHaveBeenCalledWith({
          signingSecret: 'SLACK_SIGNING_SECRET',
          token: 'SLACK_BOT_TOKEN',
          socketMode: false,
          appToken: 'SLACK_APP_TOKEN',
        });
      });
    });

    describe('when the `SLACK_APP_MODE` environment variable has `socket`', () => {
      it('creates the Slack App in socket mode', async () => {
        await withEnv({
          SLACK_SIGNING_SECRET: 'SLACK_SIGNING_SECRET',
          SLACK_BOT_TOKEN: 'SLACK_BOT_TOKEN',
          SLACK_APP_TOKEN: 'SLACK_APP_TOKEN',
          SLACK_APP_MODE: 'socket',
        }, async () => {
          await import(`./../src/index.js?randomizer=${uuid()}`);

          expect(BoltApp).toHaveBeenCalledWith({
            signingSecret: 'SLACK_SIGNING_SECRET',
            token: 'SLACK_BOT_TOKEN',
            socketMode: true,
            appToken: 'SLACK_APP_TOKEN',
          });
        });
      });
    });
  });

  it('creates the Picky instance', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(Picky.from).toHaveBeenCalledWith(db, app);
  });

  describe("listens to message events", () => {
    it('routes Slack app message events to the Picky onMessage callback', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = {event: {}};
      await app.sendEvent('message', payload);

      expect(picky.onMessage).toHaveBeenCalledWith(payload);
    });

    describe('when a message event is authored by a bot', () => {
      it('ignores the message', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        await app.sendEvent('message', {event: {bot_profile: {foo: 'bar'}}});

        expect(picky.onMessage).not.toHaveBeenCalled();
      });
    });

    describe('when a message event comes from an IM channel', () => {
      it('routes the event to the Picky onAppMention callback providing `replyAll: true`', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        const payload = {event: {channel_type: 'im'}};
        await app.sendEvent('message', payload);

        expect(picky.onAppMention).toHaveBeenCalledWith(payload, true);
      });
    });

    it('logs the error stacktrace', async () => {
      picky.onMessage.mockRejectedValue(new Error("Boom!"));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = {event: {}};
      await app.sendEvent('message', payload);

      assertThat(logger.messages.error, hasItem(allOf(
        startsWith("Error: Boom!\n"),
        containsString("at Object.<anonymous>")
      )));
    });
  });

  describe('listens to app_mention events', () => {
    it('routes Slack app mention events to the Picky onAppMention callback', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = {event: {}};
      await app.sendEvent('app_mention', payload);

      expect(picky.onAppMention).toHaveBeenCalledWith(payload);
    });

    describe('when the mention event is authored by a bot', () => {
      it('ignores the message', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        await app.sendEvent('app_mention', {event: {bot_profile: {foo: 'bar'}}});

        expect(picky.onAppMention).not.toHaveBeenCalled();
      });
    });

    it('logs the error stacktrace', async () => {
      picky.onAppMention.mockRejectedValue(new Error("Boom!"));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = {event: {}};
      await app.sendEvent('app_mention', payload);

      assertThat(logger.messages.error, hasItem(allOf(
        startsWith("Error: Boom!\n"),
        containsString("at Object.<anonymous>")
      )));
    });
  });

  describe('listens to app_home_opened events', () => {
    it('routes Slack app home opened events to the Picky onAppHomeOpened callback', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = {event: {}};
      await app.sendEvent('app_home_opened', payload);

      expect(picky.onAppHomeOpened).toHaveBeenCalledWith(payload);
    });

    it('logs the error stacktrace', async () => {
      picky.onAppHomeOpened.mockRejectedValue(new Error("Boom!"));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = {event: {}};
      await app.sendEvent('app_home_opened', payload);

      assertThat(logger.messages.error, hasItem(allOf(
        startsWith("Error: Boom!\n"),
        containsString("at Object.<anonymous>")
      )));
    });
  });

  describe('starts the Slack App', () => {
    it("calls the app's start method", async () => {
      await withEnv({
        PORT: 'PORT',
      }, async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        expect(app.start).toHaveBeenCalledWith('PORT');
      });
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
});
