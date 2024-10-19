function listCommandMatcher() {
  return /list$/;
}

export default class ListCommand {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return listCommandMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);

    const acronyms = await this.brain.list(context);
    const definedAcronyms = await Promise.all(
      Object.keys(acronyms).map(async (acronym) => {
        const ignored = await this.brain.isIgnored(context, acronym);
        const definitions = acronyms[acronym];
        return definitions.length === 1
          ? `${acronym} ${ignored ? '(ignored) ' : ''}stands for: \`${definitions[0]}\``
          : `${acronym} ${ignored ? '(ignored) ' : ''}stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
      }),
    );
    const text = definedAcronyms.length === 0 ? 'No acronyms to list' : definedAcronyms.join('\n\n');
    await client.chat.postMessage({ channel: event.channel, text });
  }
}
