import { TestLogger } from '../../test/utils.js';
import Picky from './picky.js';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';

describe('Picky', () => {
  let brain, logger, replies, commands, say, picky;

  beforeEach(() => {
    brain = new Brain(new RandomAcronyms(), {
      HTML: ['Hyper Text Markup Language'],
      API: ['Application Programming Interface'],
    });
    logger = new TestLogger();
    replies = new Replies(brain, logger);
    commands = new Commands(brain, logger);
    say = jest.fn().mockResolvedValue();
    picky = new Picky(brain, replies, commands);
  });

  describe('onMessage', () => {
    it('replies to supported messages', async () => {
      await picky.onMessage({ text: 'HTML' }, { botUserId: 'Picky' }, say);

      expect(say).toHaveBeenCalledWith('HTML stands for: `Hyper Text Markup Language`');
    });

    it('ignores unsupported messages', async () => {
      await picky.onMessage({ text: 'Some unsupported message' }, { botUserId: 'Picky' }, say);

      expect(say).not.toHaveBeenCalled();
    });

    it('ignores app mentions', async () => {
      await picky.onMessage({ text: '@Picky HTML' }, { botUserId: 'Picky' }, say);

      expect(say).not.toHaveBeenCalled();
    });
  });

  describe('onAppMention', () => {
    it('executes supported commands', async () => {
      const commandSpy = jest.fn();
      commands.get = () => ({ accept: commandSpy });
      await picky.onAppMention({ text: 'forget HTML Hyper Text Markup Language' });

      expect(commandSpy).toHaveBeenCalledWith({ text: 'forget HTML Hyper Text Markup Language' });
    });
  });
});
