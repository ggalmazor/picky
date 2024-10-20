import ReplaceCommand from './replace-command.js';
import { assertThat, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('ReplaceCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(ReplaceCommand.test({ text: '@Picky replace API Application Programming Interface' }), is(true));
      assertThat(
        ReplaceCommand.test({ text: '<@U07Q4GM0KSB> replace API Application Programming Interface' }),
        is(true),
      );
      assertThat(ReplaceCommand.test({ text: 'replace API Application Programming Interface' }), is(true));
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
      subject = new ReplaceCommand(
        brain,
        {
          async get() {
            return client;
          },
        },
        logger,
      );

      context = {};
      event = {
        channel: 'C07QK0MHHKM',
        text: '@Picky replace API Another Pale Island',
        ts: 1728412412,
      };
    });

    it('uses the brain to forget all definitions of the provided acronym', async () => {
      const spy = jest.spyOn(brain, 'forget');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'API');
    });

    it('uses the brain to learn the new definition', async () => {
      const spy = jest.spyOn(brain, 'learn');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'API', 'Another Pale Island');
    });

    it('adds a ✅ reaction to the app mention message', async () => {
      const spy = jest.spyOn(client.reactions, 'add');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith({
        channel: event.channel,
        timestamp: event.ts,
        name: 'white_check_mark',
      });
    });
  });
});
