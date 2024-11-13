import Brain from '../brain/brain.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import DbMemory from '../brain/memory/db-memory.js';

export default class Picky {
  constructor(brain, replies, commands, clients, logger) {
    this.brain = brain;
    this.replies = replies;
    this.commands = commands;
    this.clients = clients;
    this.logger = logger;
  }

  static async from(db, app, clients) {
    const memory = new DbMemory(db);
    const brain = new Brain(new RandomAcronyms(Math.random), memory, app.logger);
    const replies = Replies.load(brain, clients, app.logger);
    const commands = Commands.load(brain, clients, app.logger);
    return new Picky(brain, replies, commands, clients, app.logger);
  }

  async onMessage({ event, context }, replyAll = false) {
    const reply = this.replies.get(event);

    if (reply === undefined && replyAll) {
      const client = await this.clients.get(context);
      await client.chat.postMessage({
        channel: event.channel,
        text: `I don't know how to reply to: \`${event.text}\``,
      });
      return;
    }

    if (reply === undefined) {
      this.logger.debug(`No reply for: ${event.text}`);
      return;
    }

    this.logger.debug(`Replying to message: ${event.text}`);
    await reply.accept(context, event);
  }

  async onAppMention({ context, event }, replyAll = false) {
    const command = this.commands.get(event);

    if (command === undefined && replyAll) {
      const client = await this.clients.get(context);
      await client.chat.postMessage({
        channel: event.channel,
        text: `I don't know how to reply to: \`${event.text}\``,
      });
      return;
    }

    if (command === undefined) {
      this.logger.debug(`No command for: ${event.text}`);
      return;
    }

    this.logger.debug(`Replying to mention: ${event.text}`);
    await command.accept(context, event);
  }

  async onAppHomeOpened({ context }) {
    const client = await this.clients.get(context);

    const acronyms = await this.brain.list(context);
    const options = (
      await Promise.all(
        Object.keys(acronyms).map(async (acronym) => {
          const ignored = await this.brain.isIgnored(context, acronym);
          return acronyms[acronym].map((definition) => ({
            value: `${acronym} ${definition}`,
            text: {
              type: 'plain_text',
              text: `${acronym}${ignored ? ' (ignored) ' : ''}: ${definition}`,
            },
          }));
        }),
      )
    ).flat();

    const view = {
      type: 'home',
      title: {
        type: 'plain_text',
        text: 'Picky explains acronyms',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Welcome!* \n(nit)Picky explains acronyms used in your channels. Invite Picky; it will respond with an explanation every time someone uses an acronym. Picky will remember all the acronyms that it has listened to and explain. However, Picky will make up random acronym meanings unless someone explains them.',
          },
        },
        {
          type: 'divider',
        },
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: 'List of existing acronyms',
          },
          accessory: {
            type: 'checkboxes',
            action_id: 'delete_definitions',
            initial_options: [],
            options,
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: 'Delete selected definitions',
              },
              style: 'danger',
              action_id: 'delete_selected_definitions',
              confirm: {
                title: {
                  type: 'plain_text',
                  text: 'Are you sure?',
                },
                confirm: {
                  type: 'plain_text',
                  text: 'Yes',
                },
                deny: {
                  type: 'plain_text',
                  text: "No",
                },
              },
            },
          ],
        },
      ],
    };

    await client.views.publish({ user_id: context.userId, view: JSON.stringify(view) });
  }
}
