export default class VolatileMemory {
  constructor(data = {}, ignored = []) {
    this.data = data;
    this.ignored = ignored;
  }

  async knows(context, acronym, definition) {
    if (definition === undefined) return Promise.resolve(acronym in this.data);

    return Promise.resolve(acronym in this.data && this.data[acronym].includes(definition));
  }

  async recall(context, acronym) {
    return Promise.resolve(this.data[acronym] || []);
  }

  async learn(context, acronym, definition) {
    if (await this.knows(acronym, definition)) return Promise.resolve();

    this.data[acronym] ||= [];
    if (this.data[acronym].includes(definition)) return Promise.resolve();

    this.data[acronym].push(definition);
    return Promise.resolve();
  }

  async forget(context, acronym, definition) {
    if (!(acronym in this.data)) return Promise.resolve();
    this.data[acronym] = definition === undefined ? [] : this.data[acronym].filter((def) => def !== definition);
    if (this.data[acronym].length === 0) delete this.data[acronym];
    return Promise.resolve();
  }

  async list(context, ignored) {
    if (ignored !== undefined) {
      const selectedAcronyms = Object.keys(this.data).filter((def) => {
        const isIgnored = this.ignored.includes(def);
        return ignored ? isIgnored : !isIgnored;
      });
      return selectedAcronyms.reduce((acc, acronym) => {
        acc[acronym] = this.data[acronym];
        return acc;
      }, {});
    }
    return this.data;
  }

  async ignore(context, acronym){
    this.ignored.push(acronym);
  }

  async isIgnored(context, acronym) {
    return this.ignored.includes(acronym);
  }

  async stopIgnoring(context, acronym){
    this.ignored.splice(this.ignored.indexOf(acronym), 1);
  }
}
