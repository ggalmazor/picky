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
    const text = Object.keys(acronyms).map(acronym => {
     const definitions = acronyms[acronym];
     return definitions.length === 1
       ? `${acronym} stands for: \`${definitions[0]}\``
       : `${acronym} stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
    }).join('\n\n');
    await client.chat.postMessage({ channel: event.channel, text });
  }
}
