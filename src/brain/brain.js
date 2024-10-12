export default class Brain {
  constructor(acronyms, memory, logger) {
    this.acronyms = acronyms;
    this.memory = memory;
    this.logger = logger;
  }

  async getDefinitions(acronym) {
    if (await this.memory.knows(acronym)) return this.memory.recall(acronym);

    const definition = this.acronyms.define(acronym);
    await this.memory.learn(acronym, definition);
    return [definition];
  }

  async learn(acronym, definition) {
    return this.memory.learn(acronym, definition);
  }

  async forget(acronym, definition) {
    return this.memory.forget(acronym, definition);
  }
}
