import Picky from "../src/picky/picky.js";
import Installer from "../src/slack/installer.js";

const RANDOM_NUMBERS = [
  0.43131150217673775, 0.8812124484754995, 0.7065464533465053,
  0.9275319241087914, 0.6164626797014028, 0.13430086651980955,
  0.9115295814911684, 0.8351836348692214, 0.7817451901300174,
  0.8692921117890973, 0.10125101323139818, 0.5789629609006577,
  0.6412664847288179, 0.933415397493657, 0.11639026882335246,
  0.4362103476097281, 0.8515081012682082, 0.6842345118033197,
  0.2880783376352436, 0.3058721613409592, 0.8882657161871139,
  0.5583549904855434, 0.19215874217546403, 0.656469833017107,
  0.08664042459239751, 0.22343379588496615, 0.7266044118992789,
  0.1379608662708507, 0.7520777405511472, 0.950033195746727,
  0.7026787401984111, 0.0911072900149732, 0.1344245108084079,
  0.5861014887665195, 0.8384355766483409, 0.9515094399670723,
  0.8990589096738582, 0.3680314177361379, 0.9487247815123652,
  0.28592632983565736, 0.7622060146866565, 0.005142992123758683,
  0.8232559042778922, 0.32431560782398905, 0.6187361626134724,
  0.8813570946292653, 0.7503813206515328, 0.7893545532921287,
  0.4036394866983617, 0.5367211271678938, 0.713425200696485,
  0.61235423527005, 0.10785677376522429, 0.13776083481883283,
  0.4019294223909351, 0.9941423810681462, 0.543633946827085,
  0.03211361056883777, 0.23293599146370614, 0.7310449521700331,
  0.5679785096494367, 0.8499066772959041, 0.7829555871932323,
  0.5104896516200415, 0.6038594077672177, 0.9548994904460855,
  0.321863083415149, 0.10671838990017402, 0.4416810535592355,
  0.7638378933937942, 0.132280299101051, 0.37840551255908617,
  0.1781482010138573, 0.6704640271628983, 0.7862966430591791,
  0.11131185227694762, 0.7138267026919054, 0.2245379182144398,
  0.047225298274007566, 0.137123833627262, 0.8180904380900624,
  0.337804155451519, 0.3045353642124746, 0.38950234289623586,
  0.7527367989298988, 0.5501555427101206, 0.7146534894527887,
  0.9223469301278528, 0.22663991195501731, 0.40050037978770825,
  0.8205855556660202, 0.41516493208236027, 0.48482880194975375,
  0.001597653254500786, 0.15065006673869985, 0.25354330524272317,
  0.06154160654152108, 0.8246651423185134, 0.7130517262677456,
  0.7040157102412838
];


export const deterministicRandom = () => {
  let seq = 0;

  return () => RANDOM_NUMBERS[(seq++ % 100)];
}

export class TestLogger {
  constructor() {
    this.messages = {
      info: [],
      warning: [],
      error: [],
      debug: []
    };
  }

  info(message) {
    this.messages.info.push(message);
  }

  warn(message) {
    this.messages.warn(message);
  }

  error(message) {
    this.messages.error.push(message);
  }

  debug(message) {
    this.messages.debug.push(message);
  }
}

export const testSlackClient = () => new Proxy(
  {},
  {
    get(proxies, level1name) {
      if (proxies[level1name] !== undefined) return proxies[level1name];

      proxies[level1name] = new Proxy(
        {},
        {
          get(methods, level2name) {
            methods[level2name] ||= level1name === 'oauth' ? testSlackClient() : async () => {
            };
            return methods[level2name];
          }
        }
      );
      return proxies[level1name];
    }
  }
);

export function mockBootUpContext() {
  const logger = new TestLogger();
  const app = {
    listeners: {},
    client: testSlackClient(),
    logger: logger,
    start: jest.fn(),
    receiver: {
      routes: {}
    },
    event(event, callback) {
      this.listeners[event] = callback
    },
    async sendEvent(event, payload) {
      await this.listeners[event].call(null, payload);
    },
  };
  const BoltApp = jest.fn().mockImplementation(() => app);
  jest.unstable_mockModule('@slack/bolt', () => ({
    default: {
      App: BoltApp
    }
  }));

  const db = {};
  const knex = jest.fn().mockReturnValue(db);
  jest.unstable_mockModule('knex', () => ({
    default: knex
  }))

  const picky = {
    onMessage: jest.fn().mockResolvedValue(),
    onAppMention: jest.fn().mockResolvedValue(),
    onAppHomeOpened: jest.fn().mockResolvedValue()
  }
  Picky.from = jest.fn().mockResolvedValue(picky);

  const slackOAuth = {
    access: jest.fn().mockResolvedValue({
      access_token: 'some token',
      team: {
        id: "team ID",
        name: 'team name'
      },
      enterprise: {
        id: 'enterprise ID',
        name: 'enterprise name'
      }
    })
  };

  jest.unstable_mockModule('../src/slack/oauth', () => ({
    default: jest.fn().mockImplementation(() => slackOAuth)
  }));

  const installer = {
    completeInstallation: jest.fn().mockResolvedValue("https://foo.slack.com")
  };

  Installer.from = jest.fn().mockReturnValue(installer);

  return {app, BoltApp, db, knex, logger, picky, slackOAuth, installer};
}

