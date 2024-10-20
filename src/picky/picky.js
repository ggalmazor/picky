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
            text: `
(nit)Picky explains the acronyms that you use in Slack:
- Invite Picky to a channel, and it will listen to messages
- Picky will write a message with a definition whenever someone uses an acronym
- Picky remembers all the acronyms that it defines. However, Picky makes up random definitions, so you better teach it the good ones!

## How can Picky help your team?

Picky can make it easier for new team members by allowing them to understand what everybody else is talking about.

At Picky we're big fans of the "expose your ignorance" principle, but having the option to privately ask Picky about acronyms removes the awkwardness from the equation while a new team member gains confidence to do so in a public environment.

Here are some specific scenarios where Picky can help:

- **Onboarding of new team members**: Onboarding new team members into the domain-specific language and idioms of a team is easier when Picky can explain the acronyms used by others.

- **Helping non-native speakers blend in**: Non-native speaker team members might struggle with acronyms commonly used in the main language that's used to communicate in Slack. With Picky, you can finally what IIRC or BBIAB mean 🤷‍♀️.
- **Ensure everyone's talking about the same thing**: Just in case, Picky can help focus the conversation on the same topic by explicitly communicating what the acronym really means. Was it "Continuous Delivery" or "Continuous Deployment"?

## Commands

- [Learn an acronym](#learn)
- [Forget an acronym](#forget)
- [Replace an acronym](#replace)
- [Define an acronym](#define)
- [Ignore an acronym](#ignore)
- [Stop ignoring an acronym](#stop-ignoring)
- [List acronyms](#list)

---

### Learn

Picky can learn new acronym definitions.

Usage: \`learn <acronym> <definition>\`

Example: \`@picky learn HTML How To Make Lasagna\`

---

### Forget

Picky can forget acronyms and their definitions.

Usage: \`forget <acronym> [definition]\`

Example: \`@picky forget HTML How To Make Lasagna\`

Picky can also forget the acronym along with all existing definitions by omitting the definition in this command.

Example: \`@picky forget HTML\`

---

### Replace

Picky can replace all existing definitions of an acronym with a new one.

Usage: \`@picky replace <acronym> <definition>\`

Example: \`@picky replace HTML How To Make Lasagna\`

This command is a combination of:
\`\`\`
@picky forget HTML
@picky learn HTML How To Make Lasagna
\`\`\`

---

### Define

Picky can provide the definition of acronyms.

Usage: \`@picky define <acronym>\`

Example: \`@picky define HTML\`

Responds with: \`\`HTML stands for: \`How To Make Lasagna\` \`\`

---

### Ignore

Picky can ignore acronyms when people use them in chats.

Usage: \`@picky ignore <acronym>\`

Example: \`@picky ignore HTML\`

---

### Stop ignoring

Picky can resume defining ignored acronyms.

Usage: \`@picky stop ignoring <acronym>\`

Example: \`@picky stop ignoring HTML\`

---

### List

Picky can list all the acronyms it knows with their definitions, and tells you if they're ignored.

Usage: \`@picky list [ignored]\`

Example: \`@picky list\`

Responds with:
\`\`\`
API stands for \`Another Programmer’s Issue\`
HTML (ignored) stands for \`How To Make Lasagna\`
\`\`\`

Picky can also list only the ignored acronym by adding \`ignored\` to the command.

Example: \`@picky list ignored\`

Responds with:
\`\`\`
HTML (ignored) stands for \`How To Make Lasagna\`
\`\`\`
            `,
          },
        },
      ],
    };

    await client.views.publish({ user_id: context.userId, view: JSON.stringify(view) });
  }
}
