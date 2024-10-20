function replaceCommandMatcher() {
  return /replace ([A-Z]{2,5}) (.+?)$/;
}

export default class ReplaceCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return replaceCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);
    const [, acronym, definition] = event.text.match(replaceCommandMatcher());

    await this.brain.forget(context, acronym);
    await this.brain.learn(context, acronym, definition);
    await client.reactions.add({ name: 'white_check_mark', channel: event.channel, timestamp: event.ts });
  }
}
