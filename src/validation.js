/**
 * @param {import('./carnet-api-client').CarnetCookie[]} cookies
 */
export function validateCookies(cookies) {

  if (!Array.isArray(cookies) || cookies.length < 1) {
    throw new Error('Missing "cookies" in options!');
  }

  cookies.forEach(cookie => {
    if (!('name' in cookie)) {
      // eslint-disable-next-line no-console
      console.error('Missing "name" in cookie!', cookie);
    }

    if (!('value' in cookie)) {
      // eslint-disable-next-line no-console
      console.error('Missing "value" in cookie!', cookie);
      throw new Error('Missing "value" in cookie!');
    }
  });
}

/**
 *
 * @param {import('./carnet-api-client').SessionOptions} options
 * @param {typeof import('./utils').defaultLogger} logger
 */
// @ts-ignore
export function validate(options, logger) {
  if (!logger) {
    throw new Error('Missing logger!');
  }

  if (!options) {
    throw new Error('Missing session options!');
  }

  validateCookies(options.cookies);

  if (!options.carId) {
    throw new Error('Missing "carId" in options!');
  }

  if (!options.csrfToken) {
    throw new Error('Missing "csrfToken" in options!');
  }
}
