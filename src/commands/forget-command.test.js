import ForgetCommand from './forget-command.js';
import { assertThat, before, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger, testSlackClient } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('ForgetCommand', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Command', () => {
      assertThat(ForgetCommand.test({ text: '@Picky forget API Application Programming Interface' }), is(true));
      assertThat(ForgetCommand.test({ text: '<@U07Q4GM0KSB> forget API Application Programming Interface' }), is(true));
      assertThat(ForgetCommand.test({ text: 'forget API Application Programming Interface' }), is(true));
      assertThat(ForgetCommand.test({ text: '@Picky forget API' }), is(true));
      assertThat(ForgetCommand.test({ text: '<@U07Q4GM0KSB> forget API' }), is(true));
      assertThat(ForgetCommand.test({ text: 'forget API' }), is(true));
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
      subject = new ForgetCommand(
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
        text: '@Picky forget API Application Programming Interface',
        ts: 1728412412,
      };
    });

    it('uses the brain to forget the provided acronym definition', async () => {
      const spy = jest.spyOn(brain, 'forget');

      await subject.accept(context, event);

      expect(spy).toHaveBeenCalledWith(context, 'API', 'Application Programming Interface');
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

    describe('when not providing a definition', () => {
      beforeEach(() => {
        event = {
          channel: 'C07QK0MHHKM',
          text: '@Picky forget API',
          ts: 1728412412,
        };
      });

      it('uses the brain to forget the acronym along with all existing definitions', async () => {
        const spy = jest.spyOn(brain, 'forget');

        await subject.accept(context, event);

        expect(spy).toHaveBeenCalledWith(context, 'API');
      });
    });
  });
});
