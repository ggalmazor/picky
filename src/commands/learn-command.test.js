import LearnCommand from './learn-command.js';
import { assertThat, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('LearnCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(LearnCommand.test({ text: '@Picky learn API Application Programming Interface' }), is(true));
      assertThat(LearnCommand.test({ text: '<@U07Q4GM0KSB> learn API Application Programming Interface' }), is(true));
      assertThat(LearnCommand.test({ text: 'learn API Application Programming Interface' }), is(true));
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
      subject = new LearnCommand(
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
        text: '@Picky learn API Application Programming Interface',
        ts: 1728412412,
      };
    });

    it('uses the brain to learn the provided acronym definition', async () => {
      const spy = jest.spyOn(brain, 'learn');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'API', 'Application Programming Interface');
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
