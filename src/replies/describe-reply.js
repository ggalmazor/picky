const ACRONYM_PATTERN = /\b([A-Z]{2,5})\b/g;

export default class DescribeReply {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  static test(event) {
    return ACRONYM_PATTERN.test(event.text);
  }

  async accept(event) {
    if (!ACRONYM_PATTERN.test(event.text))
      throw new Error("Invalid event for this reply");

    const acronyms = [...event.text.matchAll(ACRONYM_PATTERN)].map(a => a[0]);
    await Promise.all(acronyms.map(acronym => {
      const definitions = this.brain.getDefinitions(acronym);
      const text = definitions.length === 1 ? `${acronym} stands for: \`${definitions[0]}\`` : `${acronym} stands for:\n\`\`\`${definitions.join("\n")}\n\`\`\``;
      return this.client.chat.postMessage({channel: event.channel, text}).catch(error => this.logger.error(error));
    }));
  }
}
