function listIgnoredCommandMatcher() {
  return /list ignored$/;
}

export default class ListIgnoredCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return listIgnoredCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);

    const acronyms = await this.brain.list(context, true);
    const definedAcronyms = await Promise.all(Object.keys(acronyms).map(async acronym => {
      const definitions = acronyms[acronym];
      return definitions.length === 1
        ? `${acronym} (ignored) stands for: \`${definitions[0]}\``
        : `${acronym} (ignored) stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
    }));
    const text = definedAcronyms.filter(definedAcronym => definedAcronym !== undefined).join('\n\n');
    await client.chat.postMessage({channel: event.channel, text});
  }
}
