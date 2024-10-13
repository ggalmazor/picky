const acronymMatcher = () => /\b([A-Z]{2,5})\b/g;

export default class DefineReply {
  constructor(brain, logger) {
    this.brain = brain;
    this.logger = logger;
  }

  static test(event) {
    return acronymMatcher().test(event.text);
  }

  async accept(event, say) {
    const acronyms = [...event.text.matchAll(acronymMatcher())].map((a) => a[0]);
    await Promise.all(
      acronyms.map(async (acronym) => {
        const definitions = await this.brain.getDefinitions(acronym);
        const text =
          definitions.length === 1
            ? `${acronym} stands for: \`${definitions[0]}\``
            : `${acronym} stands for:\n\`\`\`\n${definitions.join('\n')}\n\`\`\``;
        return say(text).catch((error) => this.logger.error(error));
      }),
    );
  }
}
