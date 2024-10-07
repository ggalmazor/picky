const FORGET_COMMAND_PATTERN = /forget ([A-Z]{2,5}) (.+?)$/;

export default class ForgetCommand {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static test(event) {
    return FORGET_COMMAND_PATTERN.test(event.text);
  }

  async accept(event) {
    if (!FORGET_COMMAND_PATTERN.test(event.text))
      throw new Error("Invalid event for this command");

    this.logger.info("Replying message: " + event.text);
    const [, acronym, definition] = event.text.match(FORGET_COMMAND_PATTERN);

    this.brain.forget(acronym, definition);
    this.client.reactions.add("white_check_mark", event.channel, event.ts);
  }
}
