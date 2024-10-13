import Picky from '../src/picky/picky.js';
import {TestLogger, testSlackClient} from "../test/utils.js";
import {assertThat, hasItem} from "hamjest";

describe('Boot up script (index)', () => {
  let app;

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
    jest.unstable_mockModule('@slack/bolt', () => ({
      default: {
        App: jest.fn().mockImplementation(() => app)
      }
    }));

    jest.unstable_mockModule('knex', () => ({
      default: jest.fn().mockReturnValue({})
    }))

    Picky.from = jest.fn();
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("Starts the Slack App in the default port when there's no `PORT` environment variable", async () => {
    await import('./../src/index.js');

    expect(app.start).toHaveBeenCalledWith(3000);
  });
});
