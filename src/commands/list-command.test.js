import ListCommand from './list-command.js';
import { assertThat, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('ListCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(ListCommand.test({ text: '@Picky list' }), is(true));
      assertThat(ListCommand.test({ text: '<@U07Q4GM0KSB> list' }), is(true));
      assertThat(ListCommand.test({ text: 'list' }), is(true));
    });
  });

  describe('apply', () => {
    let brain, memory, client, logger, subject;
    let context, event;

    beforeEach(() => {
      memory = new VolatileMemory({
        ABC: ['Agile Bouncy Coyote', "Another Banging Chaos"],
        DEF: ["Definitely Expensive Flute"],
      });
      brain = new Brain(
        new RandomAcronyms(),
        memory,
      );
      client = testSlackClient();
      logger = new TestLogger();
      subject = new ListCommand(
        brain,
        {
          async get() {
            return client;
          },
        },
        logger,
      );

      context = {};
      event = { channel: 'C07QK0MHHKM', text: '@Picky list' };
    });

    it('uses the brain to get all acronyms and their definitions', async () => {
      const spy = jest.spyOn(brain, 'list');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context);
    });

    it('Uses a Slack client to post a chat message with the acronyms and their definitions', async () => {
      const spy = jest.spyOn(client.chat, 'postMessage');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith({
        channel: event.channel,
        text: `ABC stands for:\n\`\`\`\nAgile Bouncy Coyote\nAnother Banging Chaos\n\`\`\`\n\nDEF stands for: \`Definitely Expensive Flute\``
      });
    });

    describe("when an acronym is ignored", () => {
      it("adds a note in the reply message", async () => {
        await memory.ignore(context, 'ABC');

        const spy = jest.spyOn(client.chat, 'postMessage');

        await subject.accept(context, event);

        expect(spy).toHaveBeenCalledWith({
          channel: event.channel,
          text: `ABC (ignored) stands for:\n\`\`\`\nAgile Bouncy Coyote\nAnother Banging Chaos\n\`\`\`\n\nDEF stands for: \`Definitely Expensive Flute\``
        });
      });
    });
  });
});
