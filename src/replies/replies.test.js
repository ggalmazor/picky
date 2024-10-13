import { assertThat, hasProperties, instanceOf, is } from 'hamjest';
import Replies from './replies.js';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger } from '../../test/utils.js';

class TestReply {
  constructor(brain, logger) {
    this.logger = logger;
    this.brain = brain;
  }

  static test() {
    return true;
  }
}

function buildEvent() {
  return { text: 'foo bar baz' };
}

describe('Replies', () => {
  let brain, logger, subject;

  beforeEach(() => {
    brain = new Brain(new RandomAcronyms(), {
      HTML: ['Hyper Text Markup Language'],
      API: ['Application Programming Interface'],
    });
    logger = new TestLogger();
    subject = new Replies([], brain, logger);
  });

  describe('get', () => {
    describe('when a Reply matches the provided event', () => {
      beforeEach(() => {
        subject.add(TestReply);
      });

      it('returns the Reply instance that matches the provided event', () => {
        assertThat(subject.get(buildEvent()), is(instanceOf(TestReply)));
      });

      it('passes through the brain and logger instances', () => {
        assertThat(subject.get(buildEvent()), hasProperties({ brain, logger }));
      });
    });

    describe('when no Reply matches the provided event', () => {
      it('returns `undefined`', () => {
        assertThat(subject.get(buildEvent()), is(undefined));
      });
    });
  });
});
