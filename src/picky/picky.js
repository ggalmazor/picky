import Brain from '../brain/brain.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import DbMemory from '../brain/memory/db-memory.js';

export default class Picky {
  constructor(brain, replies, commands) {
    this.brain = brain;
    this.replies = replies;
    this.commands = commands;
  }

  static async from(db, app) {
    const teamInfo = await app.client.team.info();
    const memory = await DbMemory.from(db, teamInfo.team);
    const brain = new Brain(new RandomAcronyms(Math.random), memory, app.logger);
    const replies = new Replies(brain, app.logger);
    const commands = new Commands(brain, app.client, app.logger);
    return new Picky(brain, replies, commands);
  }

  async onMessage(event, context, say) {
    if (event.text.includes(context.botUserId)) return;

    const reply = this.replies.get(event);
    if (reply === undefined) return;

    await reply.accept(event, say);
  }

  async onAppMention(event, say) {
    const command = this.commands.get(event);
    if (command === undefined) return;

    await command.accept(event, say);
  }
}
