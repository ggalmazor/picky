import Picky from '../src/picky/picky.js';
import {TestLogger, testSlackClient} from "../test/utils.js";
import {assertThat, hasItem} from "hamjest";

describe('Boot up script (index)', () => {
  let app, BoltApp, knex, db, picky;

  beforeEach(() => {
    app = {
      listeners: {},
      client: testSlackClient(),
      logger: new TestLogger(),
      start: jest.fn(),
      event(event, callback) {
        this.listeners[event] = callback
      },
      sendEvent(event, payload) {
        this.listeners[event].call(null, payload);
      }
    };
    BoltApp = jest.fn().mockImplementation(() => app);
    jest.unstable_mockModule('@slack/bolt', () => ({
      default: {
        App: BoltApp
      }
    }));

    db = {};
    knex = jest.fn().mockReturnValue(db);
    jest.unstable_mockModule('knex', () => ({
      default: knex
    }))

    picky = {
      onMessage: jest.fn(),
      onAppMention: jest.fn(),
    }
    Picky.from = jest.fn().mockResolvedValue(picky);

    process.env = {
      ...process.env,
      SLACK_SIGNING_SECRET: "SLACK_SIGNING_SECRET",
      SLACK_BOT_TOKEN: "SLACK_BOT_TOKEN",
      ENVIRONMENT: "ENVIRONMENT",
      SLACK_APP_TOKEN: "SLACK_APP_TOKEN",
      DATABASE_HOST: "DATABASE_HOST",
      DATABASE_PORT: "DATABASE_PORT",
      DATABASE_USER: "DATABASE_USER",
      DATABASE_PASSWORD: "DATABASE_PASSWORD",
      DATABASE_NAME: "DATABASE_NAME",
      PORT: "PORT",
    };
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("boots up the Slack app", async () => {
    await import('./../src/index.js');

    // Connects to te database
    expect(knex).toHaveBeenCalledWith({
      client: 'postgresql',
      connection: {
        host: "DATABASE_HOST",
        port: "DATABASE_PORT",
        user: "DATABASE_USER",
        password: "DATABASE_PASSWORD",
        database: "DATABASE_NAME",
      },
      pool: {min: 0, max: 4}
    });

    // Creates the Slack App
    expect(BoltApp).toHaveBeenCalledWith({
      signingSecret: "SLACK_SIGNING_SECRET",
      token: "SLACK_BOT_TOKEN",
      socketMode: false,
      appToken: "SLACK_APP_TOKEN",
    });

    // Creates the Picky instance
    expect(Picky.from).toHaveBeenCalledWith(db, app);

    // Routes Slack app message events to the Picky onMessage callback
    const messagePayload = {event: {}};
    app.sendEvent('message', messagePayload);

    expect(picky.onMessage).toHaveBeenCalledWith(messagePayload);

    // When the message is sent to the IM channel with the app
    // Routes Slack app message events to the Picky onAppMention callback with replyAll = true
    const imMessagePayload = {event: {channel_type: "im"}};
    app.sendEvent('message', imMessagePayload);

    expect(picky.onAppMention).toHaveBeenCalledWith(imMessagePayload, true);

    // Routes Slack app mention events to the Picky onAppMention callback
    const mentionPayload = {event: {}};
    app.sendEvent('app_mention', messagePayload);

    expect(picky.onAppMention).toHaveBeenCalledWith(mentionPayload);

    // Starts the Slack App
    expect(app.start).toHaveBeenCalledWith("PORT");

    // Logs an info message
    assertThat(app.logger.messages.info, hasItem("⚡️ Bolt app is running!"));
  });
});
