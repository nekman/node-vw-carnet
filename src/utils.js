/**
 *
 * @param {number} ms
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * @param {...any?} args
 */
// eslint-disable-next-line no-unused-vars
function noopLogger(...args) {}

export const defaultLogger = {
  time: noopLogger,
  timeEnd: noopLogger,
  warn: noopLogger,
  info: noopLogger,
  debug: noopLogger,
  log: noopLogger,
  error: noopLogger
};

