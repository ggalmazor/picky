import Brain from '../brain/brain.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import RandomAcronyms from "../brain/acronyms/random-acronyms.js";

export default class Picky {
  constructor(brain, replies, commands) {
    this.brain = brain;
    this.replies = replies;
    this.commands = commands;
  }

  static from(app) {
    const brain = new Brain(new RandomAcronyms(), app.logger);
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

  async onAppMention(event) {
    const command = this.commands.get(event);
    if (command === undefined) return;

    await command.accept(event);
  }
}
