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
