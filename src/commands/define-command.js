function defineCommandMatcher() {
  return /define ([A-Z]{2,5})$/;
}

export default class DefineCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return defineCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);
    const [, acronym] = event.text.match(defineCommandMatcher());

    const definitions = await this.brain.getDefinitions(context, acronym);
    const text =
      definitions.length === 1
        ? `${acronym} stands for: \`${definitions[0]}\``
        : `${acronym} stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
    await client.chat.postMessage({ channel: event.channel, text });
  }
}
