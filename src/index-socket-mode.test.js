import Picky from '../src/picky/picky.js';
import {TestLogger, testSlackClient} from "../test/utils.js";
import {assertThat, hasItem} from "hamjest";

describe('Boot up script (index)', () => {
  let BoltApp;

  beforeEach(() => {
    const app = {
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

    jest.unstable_mockModule('knex', () => ({
      default: jest.fn().mockReturnValue({})
    }))

    Picky.from = jest.fn();

    process.env = {
      ...process.env,
      SLACK_SIGNING_SECRET: "SLACK_SIGNING_SECRET",
      SLACK_BOT_TOKEN: "SLACK_BOT_TOKEN",
      ENVIRONMENT: "development",
      SLACK_APP_TOKEN: "SLACK_APP_TOKEN",
    };
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("creates the Slack App in socket mode when the `ENVIRONMENT` environment variable is `development`", async () => {
    await import('./../src/index.js');

    expect(BoltApp).toHaveBeenCalledWith({
      signingSecret: "SLACK_SIGNING_SECRET",
      token: "SLACK_BOT_TOKEN",
      socketMode: true,
      appToken: "SLACK_APP_TOKEN",
    });
  });
});
