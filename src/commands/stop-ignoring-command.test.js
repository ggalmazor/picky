import StopIgnoringCommand from './stop-ignoring-command.js';
import {assertThat, before, is} from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('StopIgnoringCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(StopIgnoringCommand.test({ text: '@Picky stop ignoring API' }), is(true));
      assertThat(StopIgnoringCommand.test({ text: '<@U07Q4GM0KSB> stop ignoring API' }), is(true));
      assertThat(StopIgnoringCommand.test({ text: 'stop ignoring API' }), is(true));
    });
  });

  describe('apply', () => {
    let brain, client, logger, subject;
    let context, event;

    beforeEach(() => {
      brain = new Brain(
        new RandomAcronyms(),
        new VolatileMemory(),
      );
      client = testSlackClient();
      logger = new TestLogger();
      subject = new StopIgnoringCommand(
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
        text: '@Picky stop ignoring API',
        ts: 1728412412,
      };
    });

    it('uses the brain to stop ignoring the provided acronym', async () => {
      const spy = jest.spyOn(brain, 'stopIgnoring');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'API');
    });

    it('uses a Slack client to add a reaction to the received message', async () => {
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
