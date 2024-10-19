function learnCommandMatcher() {
  return /learn ([A-Z]{2,5}) (.+?)$/;
}

export default class LearnCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return learnCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);
    const [, acronym, definition] = event.text.match(learnCommandMatcher());

    await this.brain.learn(context, acronym, definition);
    await client.reactions.add({ name: 'white_check_mark', channel: event.channel, timestamp: event.ts });
  }
}
