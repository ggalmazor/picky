function stopIgnoringCommandMatcher() {
  return /stop ignoring ([A-Z]{2,5})$/;
}

export default class StopIgnoringCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return stopIgnoringCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);
    const [, acronym] = event.text.match(stopIgnoringCommandMatcher());

    await this.brain.stopIgnoring(context, acronym);
    await client.reactions.add({ name: 'white_check_mark', channel: event.channel, timestamp: event.ts });
  }
}
