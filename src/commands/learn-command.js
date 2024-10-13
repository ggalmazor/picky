function learnCommandMatcher() {
  return /learn ([A-Z]{2,5}) (.+?)$/;
}

export default class LearnCommand {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static test(event) {
    return learnCommandMatcher().test(event.text);
  }

  async accept(event) {
    const [, acronym, definition] = event.text.match(learnCommandMatcher());

    await this.brain.learn(acronym, definition);
    this.client.reactions.add({ name: 'white_check_mark', channel: event.channel, timestamp: event.ts });
  }
}
