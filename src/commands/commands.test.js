import {assertThat, hasProperties, instanceOf, is} from 'hamjest';
import Commands from './commands.js';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import {TestLogger, testSlackClient} from '../../test/utils.js';

class TestCommand {
  constructor(brain, client, logger) {
    this.logger = logger;
    this.client = client;
    this.brain = brain;
  }

  static test() {
    return true;
  }
}

function buildEvent() {
  return {text: 'foo bar baz'};
}

describe('Commands', () => {
  let brain, client, logger, subject;

  beforeEach(() => {
    brain = new Brain(new RandomAcronyms(), {
      HTML: ['Hyper Text Markup Language'],
      API: ['Application Programming Interface'],
    });
    client = testSlackClient();
    logger = new TestLogger();
    subject = new Commands([], brain, client, logger);
  });

  describe('get', () => {
    describe("when a Command matches the provided event", () => {
      beforeEach(() => {
        subject.add(TestCommand);
      });

      it('returns the Command instance that matches the provided event', () => {
        assertThat(subject.get(buildEvent()), is(instanceOf(TestCommand)));
      });

      it('passes through the brain, client, and logger instances', () => {
        assertThat(subject.get(buildEvent()), hasProperties({brain, client, logger}));
      });
    });

    describe("when no Command matches the provided event", () => {
      it('returns `undefined`', () => {
        assertThat(subject.get(buildEvent()), is(undefined));
      });
    });
  });
});
