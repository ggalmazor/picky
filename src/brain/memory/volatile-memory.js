export default class VolatileMemory {
  constructor(data = {}) {
    this.data = data;
  }

  async knows(acronym, definition) {
    if (definition === undefined) return Promise.resolve(acronym in this.data);

    return Promise.resolve(acronym in this.data && this.data[acronym].includes(definition));
  }

  async recall(acronym) {
    return Promise.resolve(this.data[acronym] || []);
  }

  async learn(acronym, definition) {
    if (await this.knows(acronym, definition)) return Promise.resolve();

    this.data[acronym] ||= [];
    this.data[acronym].push(definition);
    return Promise.resolve();
  }

  async forget(acronym, definition) {
    if (!(acronym in this.data)) return Promise.resolve();
    this.data[acronym] = this.data[acronym].filter((def) => def !== definition);
    if (this.data[acronym].length === 0) delete this.data[acronym];
    return Promise.resolve();
  }
}
