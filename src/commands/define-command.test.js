import DefineCommand from './define-command.js';
import { assertThat, hasItem, is } from 'hamjest';
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
    let brain, client, logger, say, subject;

    beforeEach(() => {
      brain = new Brain(
        new RandomAcronyms(),
        new VolatileMemory({
          API: ['Application Programming Interface'],
        }),
      );
      client = testSlackClient();
      logger = new TestLogger();
      subject = new DefineCommand(brain, client, logger);
      say = jest.fn().mockResolvedValue();
    });

    it('uses the brain to get acronym definitions', async () => {
      const spy = jest.spyOn(brain, 'getDefinitions');

      await subject.accept({ text: '@Picky define API' }, say);

      expect(spy).toHaveBeenCalledWith('API');
    });

    it('Uses the event `say` function to reply with the definition', async () => {
      await subject.accept({ text: '@Picky define API' }, say);

      expect(say).toHaveBeenCalledWith('API stands for: `Application Programming Interface`');
    });

    describe('when the brain knows multiple definitions', () => {
      beforeEach(() => {
        brain.learn('API', 'Apple Pie Inside');
      });

      it('Uses the event `say` function to reply in a single line', async () => {
        await subject.accept({ text: '@Picky define API' }, say);

        expect(say).toHaveBeenCalledWith(
          'API stands for:\n```\nApplication Programming Interface\nApple Pie Inside\n```',
        );
      });
    });
  });
});
