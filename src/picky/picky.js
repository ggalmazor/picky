import Brain from '../brain/brain.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import DbMemory from '../brain/memory/db-memory.js';

export default class Picky {
  constructor(brain, replies, commands, logger) {
    this.brain = brain;
    this.replies = replies;
    this.commands = commands;
    this.logger = logger;
  }

  static async from(db, app) {
    const teamInfo = await app.client.team.info();
    const memory = await DbMemory.from(db, teamInfo.team);
    const brain = new Brain(new RandomAcronyms(Math.random), memory, app.logger);
    const replies = new Replies(brain, app.logger);
    const commands = new Commands(brain, app.client, app.logger);
    return new Picky(brain, replies, commands, app.logger);
  }

  async onMessage(event, context, say) {
    if (event.text.includes(context.botUserId)) return;

    const reply = this.replies.get(event);
    if (reply === undefined) {
      this.logger.debug(`No reply for: ${event.text}`)
      return;
    }

    this.logger.info(`Replying to message: ${event.text}`)
    await reply.accept(event, say);
  }

  async onAppMention(event, say) {
    const command = this.commands.get(event);
    if (command === undefined) {
      this.logger.debug(`No command for: ${event.text}`)
      return;
    }

    this.logger.info(`Replying to mention: ${event.text}`)
    await command.accept(event, say);
  }
}
