import DefineReply from './define-reply.js';
import {assertThat, is} from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import {TestLogger, testSlackClient} from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('DefineReply', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Reply', () => {
      assertThat(DefineReply.test({text: 'Has a single acronym: FOO'}), is(true));
      assertThat(DefineReply.test({text: 'Has multiple acronyms: FOO BAR'}), is(true));
      assertThat(DefineReply.test({text: 'FOO Acronyms can be BAR in any position BAZ'}), is(true));
      assertThat(DefineReply.test({text: 'No acronyms'}), is(false));
      assertThat(DefineReply.test({text: 'Acronyms have at least 2 letters: A'}), is(false));
      assertThat(DefineReply.test({text: 'Acronyms have at most 5 letters: ABCDEF'}), is(false));
    });
  });

  describe('apply', () => {
    let brain, client, logger, subject;
    let context, event;

    beforeEach(() => {
      brain = new Brain(
        new RandomAcronyms(),
        new VolatileMemory({
          HTML: ['Hyper Text Markup Language'],
          API: ['Application Programming Interface'],
        }),
      );
      client = testSlackClient();
      logger = new TestLogger();
      subject = new DefineReply(brain, {
        async get() {
          return client;
        }
      }, logger);

      context = {};
      event = {channel: 'C07QK0MHHKM', text: 'HTML API'};
    });

    it('uses the brain to get acronym definitions', async () => {
      const spy = jest.spyOn(brain, 'getDefinitions');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'HTML');
      expect(spy).toHaveBeenCalledWith(context, 'API');
    });

    it('Uses a Slack client to post a chat message with the definition in a single line', async () => {
      const spy = jest.spyOn(client.chat, 'postMessage');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith({
        channel: event.channel,
        text: 'HTML stands for: `Hyper Text Markup Language`'
      });
      expect(spy).toHaveBeenCalledWith({
        channel: event.channel,
        text: 'API stands for: `Application Programming Interface`'
      });
    });

    describe('when the brain knows multiple definitions', () => {
      beforeEach(() => {
        brain.learn(context, 'HTML', 'How To Make Lasagna');
        brain.learn(context, 'API', 'Apple Pie Inside');
      });

      it('Uses a Slack client to post a chat message with the definitions in a code block', async () => {
        const spy = jest.spyOn(client.chat, 'postMessage');

        await subject.accept(context, event);

        expect(spy).toHaveBeenCalledWith({
          channel: event.channel,
          text: 'API stands for:\n```\nApplication Programming Interface\nApple Pie Inside\n```'
        });
        expect(spy).toHaveBeenCalledWith({
          channel: event.channel,
          text: 'HTML stands for:\n```\nHyper Text Markup Language\nHow To Make Lasagna\n```'
        });
      });
    });
  });
});
