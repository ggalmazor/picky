import Brain from '../brain/brain.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import DbMemory from '../brain/memory/db-memory.js';

export default class Picky {
  constructor(brain, replies, commands, client, logger) {
    this.brain = brain;
    this.replies = replies;
    this.commands = commands;
    this.client = client;
    this.logger = logger;
  }

  static async from(db, app) {
    const teamInfo = await app.client.team.info();
    const memory = await DbMemory.from(db, teamInfo.team);
    const brain = new Brain(new RandomAcronyms(Math.random), memory, app.logger);
    const replies = Replies.load(brain, app.logger);
    const commands = Commands.load(brain, app.client, app.logger);
    return new Picky(brain, replies, commands, app.client, app.logger);
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

  async onAppHomeOpened(payload) {
    let view = {
      type: 'home',
      title: {
        type: 'plain_text',
        text: 'Picky explains acronyms'
      },
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Welcome!* \n(nit)Picky explains acronyms used in your channels. Invite Picky; it will respond with an explanation every time someone uses an acronym. Picky will remember all the acronyms that it has listened to and explain. However, Picky will make up random acronym meanings unless someone explains them."
          },
        }
      ]
    };

    const response = await this.client.views.publish({
      user_id: payload.context.userId,
      view: JSON.stringify(view)
    }).catch(error => {
      this.logger.error(error);
    });
    console.log(response);
  }
}
