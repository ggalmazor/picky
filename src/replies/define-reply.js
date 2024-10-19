const acronymMatcher = () => /\b([A-Z]{2,5})\b/g;

export default class DefineReply {
  constructor(brain, clients, logger) {
    this.brain = brain;
    this.clients = clients;
    this.logger = logger;
  }

  static test(event) {
    return acronymMatcher().test(event.text);
  }

  async accept(context, event) {
    const client = await this.clients.get(context);
    const acronyms = [...event.text.matchAll(acronymMatcher())].map((a) => a[0]);
    await Promise.all(
      acronyms.map(async (acronym) => {
        if (await this.brain.isIgnored(context, acronym))
          return;

        const definitions = await this.brain.getDefinitions(context, acronym);
        const text =
          definitions.length === 1
            ? `${acronym} stands for: \`${definitions[0]}\``
            : `${acronym} stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
        return client.chat.postMessage({ channel: event.channel, text });
      }),
    );
  }
}
