function ignoreCommandMatcher() {
  return /ignore ([A-Z]{2,5})$/;
}

export default class IgnoreCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return ignoreCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);
    const [, acronym] = event.text.match(ignoreCommandMatcher());

    await this.brain.ignore(context, acronym);
    await client.reactions.add({ name: 'white_check_mark', channel: event.channel, timestamp: event.ts });
  }
}
