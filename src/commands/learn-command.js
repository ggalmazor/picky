const LEARN_COMMAND_PATTERN = /learn ([A-Z]{2,5}) (.+?)$/;

export default class LearnCommand {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static test(event) {
    return LEARN_COMMAND_PATTERN.test(event.text);
  }

  async accept(event) {
    if (!LEARN_COMMAND_PATTERN.test(event.text))
      throw new Error("Invalid event for this command");

    this.logger.info("Replying message: " + event.text);
    const [, acronym, definition] = event.text.match(LEARN_COMMAND_PATTERN);

    this.brain.learn(acronym, definition);
    this.client.reactions.add({name: "white_check_mark", channel: event.channel, timestamp: event.ts});
  }
}
