export default class Brain {
  constructor(acronyms, memory, logger) {
    this.acronyms = acronyms;
    this.memory = memory;
    this.logger = logger;
  }

  async getDefinitions(context, acronym) {
    if (await this.memory.knows(context, acronym)) return this.memory.recall(context, acronym);

    const definition = this.acronyms.define(acronym);
    await this.memory.learn(context, acronym, definition);
    return [definition];
  }

  async learn(context, acronym, definition) {
    return this.memory.learn(context, acronym, definition);
  }

  async forget(context, acronym, definition) {
    return this.memory.forget(context, acronym, definition);
  }

  async list(context) {
    return this.memory.list(context);
  }

  async ignore(context, acronym) {
    return this.memory.ignore(context, acronym);
  }

  async isIgnored(context, acronym) {
    return this.memory.isIgnored(context, acronym);
  }
}
