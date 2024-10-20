import { v4 as uuid } from 'uuid';
import { mockBootUpContext } from '../test/utils.js';
import { allOf, assertThat, containsString, hasItem, hasProperty, is, not, startsWith, undefined } from 'hamjest';
import SlackClients from './slack/clients.js';
import Picky from './picky/picky.js';

async function withEnv(envEntries, block) {
  const originalEnv = process.env;
  process.env = {
    ...originalEnv,
    ...envEntries,
  };

  await block();

  process.env = originalEnv;
}

describe('Boot up script (index)', () => {
  const { app, BoltApp, db, knex, logger, clients, picky, slackOAuth, installer } = mockBootUpContext();

  afterEach(async () => {
    jest.clearAllMocks();
  });

  describe("sets up Picky's dependencies", () => {
    it('connects to the database', async () => {
      await withEnv(
        {
          DATABASE_HOST: 'DATABASE_HOST',
          DATABASE_PORT: 'DATABASE_PORT',
          DATABASE_USER: 'DATABASE_USER',
          DATABASE_PASSWORD: 'DATABASE_PASSWORD',
          DATABASE_NAME: 'DATABASE_NAME',
        },
        async () => {
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
        },
      );
    });

    it('creates the Slack App', async () => {
      await withEnv(
        {
          SLACK_SIGNING_SECRET: 'SLACK_SIGNING_SECRET',
          SLACK_BOT_TOKEN: 'SLACK_BOT_TOKEN',
          SLACK_APP_TOKEN: 'SLACK_APP_TOKEN',
          SLACK_APP_MODE: 'https',
        },
        async () => {
          await import(`./../src/index.js?randomizer=${uuid()}`);

          expect(BoltApp).toHaveBeenCalledWith({
            signingSecret: 'SLACK_SIGNING_SECRET',
            token: 'SLACK_BOT_TOKEN',
            socketMode: false,
            appToken: 'SLACK_APP_TOKEN',
          });
        },
      );
    });

    describe('when the `SLACK_APP_MODE` environment variable has `socket`', () => {
      it('creates the Slack App in socket mode', async () => {
        await withEnv(
          {
            SLACK_SIGNING_SECRET: 'SLACK_SIGNING_SECRET',
            SLACK_BOT_TOKEN: 'SLACK_BOT_TOKEN',
            SLACK_APP_TOKEN: 'SLACK_APP_TOKEN',
            SLACK_APP_MODE: 'socket',
          },
          async () => {
            await import(`./../src/index.js?randomizer=${uuid()}`);

            expect(BoltApp).toHaveBeenCalledWith({
              signingSecret: 'SLACK_SIGNING_SECRET',
              token: 'SLACK_BOT_TOKEN',
              socketMode: true,
              appToken: 'SLACK_APP_TOKEN',
            });
          },
        );
      });
    });
  });

  it('creates the SlackClients instance', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(SlackClients.build).toHaveBeenCalledWith(db, logger);
  });

  it('creates the Picky instance', async () => {
    await import(`./../src/index.js?randomizer=${uuid()}`);

    expect(Picky.from).toHaveBeenCalledWith(db, app, clients);
  });

  describe('listens to message events', () => {
    it('routes Slack app message events to the Picky onMessage callback', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('message', payload);

      expect(picky.onMessage).toHaveBeenCalledWith(payload);
    });

    describe('when a message event is authored by a bot', () => {
      it('ignores the message', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        await app.sendEvent('message', { event: { bot_profile: { foo: 'bar' } } });

        expect(picky.onMessage).not.toHaveBeenCalled();
      });
    });

    describe('when a message event comes from an IM channel', () => {
      it('routes the event to the Picky onAppMention callback providing `replyAll: true`', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        const payload = { event: { channel_type: 'im' } };
        await app.sendEvent('message', payload);

        expect(picky.onAppMention).toHaveBeenCalledWith(payload, true);
      });
    });

    it('logs the error stacktrace', async () => {
      picky.onMessage.mockRejectedValue(new Error('Boom!'));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('message', payload);

      assertThat(
        logger.messages.error,
        hasItem(allOf(startsWith('Error: Boom!\n'), containsString('at Object.<anonymous>'))),
      );
    });
  });

  describe('listens to app_mention events', () => {
    it('routes Slack app mention events to the Picky onAppMention callback', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('app_mention', payload);

      expect(picky.onAppMention).toHaveBeenCalledWith(payload);
    });

    describe('when the mention event is authored by a bot', () => {
      it('ignores the message', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        await app.sendEvent('app_mention', { event: { bot_profile: { foo: 'bar' } } });

        expect(picky.onAppMention).not.toHaveBeenCalled();
      });
    });

    it('logs the error stacktrace', async () => {
      picky.onAppMention.mockRejectedValue(new Error('Boom!'));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('app_mention', payload);

      assertThat(
        logger.messages.error,
        hasItem(allOf(startsWith('Error: Boom!\n'), containsString('at Object.<anonymous>'))),
      );
    });
  });

  describe('listens to app_home_opened events', () => {
    it('routes Slack app home opened events to the Picky onAppHomeOpened callback', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('app_home_opened', payload);

      expect(picky.onAppHomeOpened).toHaveBeenCalledWith(payload);
    });

    it('logs the error stacktrace', async () => {
      picky.onAppHomeOpened.mockRejectedValue(new Error('Boom!'));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('app_home_opened', payload);

      assertThat(
        logger.messages.error,
        hasItem(allOf(startsWith('Error: Boom!\n'), containsString('at Object.<anonymous>'))),
      );
    });
  });

  describe('listens to app_uninstalled events', () => {
    it('triggers the uninstall operation with the team_id in the event', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: { team_id: 'TEAMID' } };
      await app.sendEvent('app_uninstalled', payload);

      expect(installer.uninstall).toHaveBeenCalledWith('TEAMID');
    });

    it('adds a log message', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: { team_id: 'TEAMID' } };
      await app.sendEvent('app_uninstalled', payload);

      assertThat(logger.messages.info, hasItem('⚠️ Team TEAMID uninstalled'));
    });

    it('logs the error stacktrace', async () => {
      installer.uninstall.mockRejectedValue(new Error('Boom!'));

      await import(`./../src/index.js?randomizer=${uuid()}`);

      const payload = { event: {} };
      await app.sendEvent('app_uninstalled', payload);

      assertThat(
        logger.messages.error,
        hasItem(allOf(startsWith('Error: Boom!\n'), containsString('at Object.<anonymous>'))),
      );
    });
  });

  describe('sets up OAuth installations', () => {
    let req, res;

    beforeEach(() => {
      req = {
        url: '/foo?bar=33&code=some%20code&baz=44',
      };
      res = {
        writeHead: jest.fn(),
        end: jest.fn(),
      };
    });
    it('sets up a custom route to deal with OAuth installations', async () => {
      await import(`./../src/index.js?randomizer=${uuid()}`);

      assertThat(app.receiver.routes, hasProperty('/oauth', hasProperty('GET', is(not(undefined())))));
    });

    it('exchanges the received code for an access token', async () => {
      req = {
        url: `/foo?${new URLSearchParams({ code: 'some code' }).toString()}`,
      };

      await import(`./../src/index.js?randomizer=${uuid()}`);

      await app.receiver.routes['/oauth']['GET'](req, res);

      expect(slackOAuth.access).toHaveBeenCalledWith('some code');
    });

    it('completes the installation of the app for the received team', async () => {
      const accessToken = 'some token';
      const team = { id: 'TEAMID', name: 'team name' };
      const enterprise = { id: 'enterprise ID', name: 'enterprise name' };
      slackOAuth.access.mockResolvedValue({ accessToken, team, enterprise });

      await import(`./../src/index.js?randomizer=${uuid()}`);

      await app.receiver.routes['/oauth']['GET'](req, res);

      expect(installer.completeInstallation).toHaveBeenCalledWith(team, enterprise, accessToken);
    });

    it('adds a log message', async () => {
      const accessToken = 'some token';
      const team = { id: 'TEAMID', name: 'team name' };
      const enterprise = { id: 'enterprise ID', name: 'enterprise name' };
      slackOAuth.access.mockResolvedValue({ accessToken, team, enterprise });

      await import(`./../src/index.js?randomizer=${uuid()}`);

      await app.receiver.routes['/oauth']['GET'](req, res);

      assertThat(logger.messages.info, hasItem('🎉 Team TEAMID installed'));
    });

    it("responds with an HTTP 302 targeting the team's Slack URL", async () => {
      installer.completeInstallation.mockResolvedValue('https://foo.slack.com');

      await import(`./../src/index.js?randomizer=${uuid()}`);

      await app.receiver.routes['/oauth']['GET'](req, res);

      expect(res.writeHead).toHaveBeenCalledWith(302, { Location: 'https://foo.slack.com' });
      expect(res.end).toHaveBeenCalledWith('Success! You will now be redirected to https://foo.slack.com');
    });
  });

  describe('starts the Slack App', () => {
    it("calls the app's start method", async () => {
      await withEnv(
        {
          PORT: 'PORT',
        },
        async () => {
          await import(`./../src/index.js?randomizer=${uuid()}`);

          expect(app.start).toHaveBeenCalledWith('PORT');
        },
      );
    });

    describe("when there's no `PORT` environment variable", () => {
      it('Starts the Slack App in the default port', async () => {
        await import(`./../src/index.js?randomizer=${uuid()}`);

        expect(app.start).toHaveBeenCalledWith(3000);
      });
    });
  });
});
