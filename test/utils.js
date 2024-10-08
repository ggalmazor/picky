export const withDeterministicRandom = (block) => {
  const originalRandom = Math.random;
  Math.random = (() => {
    let seq = 0;
    let numbers = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

    return () => numbers[(seq++ % 10)];
  })();

  const output = block();

  Math.random = originalRandom;

  return output;
}

export class TestLogger {
  constructor() {
    this.messages = {
      info: [],
      warning: [],
      error: [],
      debug: []
    };
  }

  info(message) {
    this.messages.info.push(message);
  }

  warn(message) {
    this.messages.warn(message);
  }

  error(message) {
    this.messages.error.push(message);
  }

  debug(message) {
    this.messages.debug.push(message);
  }
}

export const testSlackClient = () => new Proxy(
    {},
    {
      get(proxies, name) {
        if (proxies[name] !== undefined) return proxies[name];

        proxies[name] = new Proxy(
            {},
            {
              get(methods, name) {
                methods[name] ||= () => {
                };
                return methods[name];
              }
            }
        );
        return proxies[name];
      }
    }
);

