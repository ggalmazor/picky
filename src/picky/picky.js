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
    const replies = Replies.load(brain, app.logger);
    const commands = Commands.load(brain, app.client, app.logger);
    return new Picky(brain, replies, commands, app.logger);
  }

  async onMessage(payload, replyAll = false) {
    const { event, context, say } = payload;
    const reply = this.replies.get(event);

    if (reply === undefined && replyAll)
      return say(`I don't know how to reply to: \`${event.text}\``).catch((error) => this.logger.error(error));

    if (event.text.includes(context.botUserId)) {
      this.logger.debug(`Ignoring message with mention: ${event.text}`);
      return;
    }

    if (reply === undefined) {
      this.logger.debug(`No reply for: ${event.text}`);
      return;
    }

    this.logger.info(`Replying to message: ${event.text}`);
    await reply.accept(event, say);
  }

  async onAppMention(payload, replyAll = false) {
    const { event, say } = payload;
    const command = this.commands.get(event);

    if (command === undefined && replyAll)
      return say(`I don't know how to reply to: \`${event.text}\``).catch((error) => this.logger.error(error));

    if (command === undefined) {
      this.logger.debug(`No command for: ${event.text}`);
      return;
    }

    this.logger.info(`Replying to mention: ${event.text}`);
    await command.accept(event, say);
  }
}
