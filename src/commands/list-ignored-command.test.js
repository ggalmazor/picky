import ListIgnoredCommand from './list-ignored-command.js';
import { assertThat, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('ListIgnoredCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(ListIgnoredCommand.test({ text: '@Picky list' }), is(false));
      assertThat(ListIgnoredCommand.test({ text: '<@U07Q4GM0KSB> list' }), is(false));
      assertThat(ListIgnoredCommand.test({ text: 'list' }), is(false));

      assertThat(ListIgnoredCommand.test({ text: '@Picky list ignored' }), is(true));
      assertThat(ListIgnoredCommand.test({ text: '<@U07Q4GM0KSB> list ignored' }), is(true));
      assertThat(ListIgnoredCommand.test({ text: 'list ignored' }), is(true));
    });
  });

  describe('apply', () => {
    let brain, memory, client, logger, subject;
    let context, event;

    beforeEach(() => {
      memory = new VolatileMemory({
        ABC: ['Agile Bouncy Coyote', "Another Banging Chaos"],
        DEF: ["Definitely Expensive Flute"],
      }, ['ABC']);
      brain = new Brain(
        new RandomAcronyms(),
        memory,
      );
      client = testSlackClient();
      logger = new TestLogger();
      subject = new ListIgnoredCommand(
        brain,
        {
          async get() {
            return client;
          },
        },
        logger,
      );

      context = {};
      event = { channel: 'C07QK0MHHKM', text: '@Picky list ignored' };
    });

    it('uses the brain to get ignored acronyms and their definitions', async () => {
      const spy = jest.spyOn(brain, 'list');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, true);
    });

    it('Uses a Slack client to post a chat message with the acronyms and their definitions', async () => {
      const spy = jest.spyOn(client.chat, 'postMessage');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith({
        channel: event.channel,
        text: `ABC (ignored) stands for:\n\`\`\`\nAgile Bouncy Coyote\nAnother Banging Chaos\n\`\`\``
      });
    });
  });
});
