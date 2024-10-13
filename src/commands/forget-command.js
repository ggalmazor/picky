const forgetCommandMatcher = () => /forget ([A-Z]{2,5}) (.+?)$/;

export default class ForgetCommand {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static test(event) {
    return forgetCommandMatcher().test(event.text);
  }

  async accept(event) {
    const [, acronym, definition] = event.text.match(forgetCommandMatcher());

    this.brain.forget(acronym, definition);
    this.client.reactions.add({ name: 'white_check_mark', channel: event.channel, timestamp: event.ts });
  }
}
