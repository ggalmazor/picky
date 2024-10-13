import DefineReply from './define-reply.js';
import { assertThat, hasItem, is } from 'hamjest';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import { TestLogger } from '../../test/utils.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';

describe('DefineReply', () => {
  describe('test', () => {
    it('returns true if the provided text matches the expected pattern for this Reply', () => {
      assertThat(DefineReply.test({ text: 'Has a single acronym: FOO' }), is(true));
      assertThat(DefineReply.test({ text: 'Has multiple acronyms: FOO BAR' }), is(true));
      assertThat(DefineReply.test({ text: 'FOO Acronyms can be BAR in any position BAZ' }), is(true));
      assertThat(DefineReply.test({ text: 'No acronyms' }), is(false));
      assertThat(DefineReply.test({ text: 'Acronyms have at least 2 letters: A' }), is(false));
      assertThat(DefineReply.test({ text: 'Acronyms have at most 5 letters: ABCDEF' }), is(false));
    });
  });

  describe('apply', () => {
    let brain, logger, subject, say;

    beforeEach(() => {
      brain = new Brain(
        new RandomAcronyms(),
        new VolatileMemory({
          HTML: ['Hyper Text Markup Language'],
          API: ['Application Programming Interface'],
        }),
      );
      logger = new TestLogger();
      subject = new DefineReply(brain, logger);
      say = jest.fn().mockResolvedValue();
    });

    it('logs an info message', async () => {
      await subject.accept({ text: 'HTML' }, say);

      assertThat(logger.messages.info, hasItem('Replying message: HTML'));
    });

    it('uses the brain to get acronym definitions', async () => {
      const spy = jest.spyOn(brain, 'getDefinitions');

      await subject.accept({ text: 'HTML API' }, say);

      expect(spy).toHaveBeenCalledWith('HTML');
      expect(spy).toHaveBeenCalledWith('API');
    });

    it('Uses the event `say` function to reply with the definition', async () => {
      await subject.accept({ text: 'HTML API' }, say);

      expect(say).toHaveBeenCalledWith('HTML stands for: `Hyper Text Markup Language`');
      expect(say).toHaveBeenCalledWith('API stands for: `Application Programming Interface`');
    });

    describe('when the brain knows multiple definitions', () => {
      beforeEach(() => {
        brain.learn('HTML', 'How To Make Lasagna');
        brain.learn('API', 'Apple Pie Inside');
      });

      it('Uses the event `say` function to reply in a single line', async () => {
        await subject.accept({ text: 'HTML API' }, say);

        expect(say).toHaveBeenCalledWith('HTML stands for:\n```\nHyper Text Markup Language\nHow To Make Lasagna\n```');
        expect(say).toHaveBeenCalledWith(
          'API stands for:\n```\nApplication Programming Interface\nApple Pie Inside\n```',
        );
      });
    });
  });
});
