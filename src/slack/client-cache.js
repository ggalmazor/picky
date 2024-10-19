export default class ClientCache {
  constructor(storage) {
    this.storage = storage;
  }

  static empty() {
    return new ClientCache({});
  }

  async fetch(key, factory) {
    this.storage[key] ||= factory();
    return this.storage[key];
  }
}
