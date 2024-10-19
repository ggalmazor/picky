import DefineCommand from './define-command.js';
import { assertThat, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('DefineCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(DefineCommand.test({ text: '@Picky define API' }), is(true));
      assertThat(DefineCommand.test({ text: '<@U07Q4GM0KSB> define API' }), is(true));
      assertThat(DefineCommand.test({ text: 'define API' }), is(true));
      assertThat(DefineCommand.test({ text: 'define API foo' }), is(false));
      assertThat(DefineCommand.test({ text: 'define foo' }), is(false));
      assertThat(DefineCommand.test({ text: 'define foo bar' }), is(false));
    });
  });

  describe('apply', () => {
    let brain, memory, client, logger, subject;
    let context, event;

    beforeEach(() => {
      memory = new VolatileMemory({
        API: ['Application Programming Interface'],
      });
      brain = new Brain(
        new RandomAcronyms(),
        memory,
      );
      client = testSlackClient();
      logger = new TestLogger();
      subject = new DefineCommand(
        brain,
        {
          async get() {
            return client;
          },
        },
        logger,
      );

      context = {};
      event = { channel: 'C07QK0MHHKM', text: '@Picky define API' };
    });

    it('uses the brain to get acronym definitions', async () => {
      const spy = jest.spyOn(brain, 'getDefinitions');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'API');
    });

    it('Uses a Slack client to post a chat message with the definition in a single line', async () => {
      const spy = jest.spyOn(client.chat, 'postMessage');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith({
        channel: event.channel,
        text: 'API stands for: `Application Programming Interface`',
      });
    });

    describe('when the brain knows multiple definitions', () => {
      beforeEach(() => {
        brain.learn(context, 'API', 'Apple Pie Inside');
      });

      it('Uses a Slack client to post a chat message with the definitions in a code block', async () => {
        const spy = jest.spyOn(client.chat, 'postMessage');

        await subject.accept(context, event);

        expect(spy).toHaveBeenCalledWith({
          channel: event.channel,
          text: 'API stands for:\n```\nApplication Programming Interface\nApple Pie Inside\n```',
        });
      });
    });

    describe("when the acronym is ignored", () => {
      it("adds a note in the reply message", async () => {
        await memory.ignore(context, 'API');

        const spy = jest.spyOn(client.chat, 'postMessage');

        await subject.accept(context, event);

        expect(spy).toHaveBeenCalledWith({
          channel: event.channel,
          text: 'API (ignored) stands for: `Application Programming Interface`',
        });
      });
    });
  });
});
