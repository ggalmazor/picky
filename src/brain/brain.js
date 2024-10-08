import RandomAcronyms from "./acronyms/random-acronyms.js";

export default class Brain {
  constructor(acronyms, memory, logger) {
    this.acronyms = acronyms;
    this.memory = memory;
    this.logger = logger;
  }

  getDefinitions(acronym) {
    if (acronym in this.memory)
      return this.memory[acronym];

    return this.memory[acronym] = [this.acronyms.define(acronym)];
  }

  learn(acronym, definition) {
    this.memory[acronym] = this.memory[acronym] || [];
    if (this.memory[acronym].includes(definition))
      return;

    this.memory[acronym].push(definition);
  }

  forget(acronym, definition) {
    if (!(acronym in this.memory))
      return;

    this.memory[acronym] = this.memory[acronym].filter(memorizedDefinition => memorizedDefinition !== definition);
    if (this.memory[acronym].length === 0)
      delete this.memory[acronym];
  }
}
