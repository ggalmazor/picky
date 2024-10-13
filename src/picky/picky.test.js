import { TestLogger } from '../../test/utils.js';
import Picky from './picky.js';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';
import {assertThat, hasItem} from "hamjest";

describe('Picky', () => {
  let brain, logger, replies, commands, say, picky;

  beforeEach(() => {
    brain = new Brain(
      new RandomAcronyms(),
      new VolatileMemory({
        HTML: ['Hyper Text Markup Language'],
        API: ['Application Programming Interface'],
      }),
    );
    logger = new TestLogger();
    replies = new Replies(brain, logger);
    commands = new Commands(brain, logger);
    say = jest.fn().mockResolvedValue();
    picky = new Picky(brain, replies, commands, logger);
  });

  describe('onMessage', () => {
    it('logs an info message', async () => {
      await picky.onMessage({ text: 'HTML' }, { botUserId: 'Picky' }, say);

      assertThat(logger.messages.info, hasItem('Replying message: HTML'));
    });

    it("logs a debug message if there's no Reply for the message", async () => {
      await picky.onMessage({ text: 'foo bar baz' }, { botUserId: 'Picky' }, say);

      assertThat(logger.messages.debug, hasItem('No reply for: foo bar baz'));
    });

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
    it('logs an info message', async () => {
      commands.get = () => ({ accept: () => {} });

      await picky.onAppMention({ text: 'define HTML' }, say);

      assertThat(logger.messages.info, hasItem('Replying to mention: define HTML'));
    });

    it("logs a debug message if there's no Reply for the message", async () => {
      await picky.onAppMention({ text: 'foo bar baz' }, say);

      assertThat(logger.messages.debug, hasItem('No command for: foo bar baz'));
    });

    it('executes supported commands', async () => {
      const commandSpy = jest.fn();
      commands.get = () => ({ accept: commandSpy });

      await picky.onAppMention({ text: 'define HTML' }, say);

      expect(commandSpy).toHaveBeenCalledWith({ text: 'define HTML' }, say);
    });
  });
});
