function defineCommandMatcher() {
  return /define ([A-Z]{2,5})$/;
}

export default class DefineCommand {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static test(event) {
    return defineCommandMatcher().test(event.text);
  }

  async accept(event, say) {
    this.logger.info('Replying message: ' + event.text);
    const [, acronym] = event.text.match(defineCommandMatcher());

    const definitions = await this.brain.getDefinitions(acronym);
    const text =
      definitions.length === 1
        ? `${acronym} stands for: \`${definitions[0]}\``
        : `${acronym} stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
    return say(text).catch((error) => this.logger.error(error));
  }
}
