import fetch from 'node-fetch';
import https from 'https';
import { defaultLogger } from './utils';
import { BASE_URL, DASHBOARD_URL } from './constants';

/** @typedef {{ name: string, value: string }} CarnetCookie */
/** @typedef {{ csrfToken: string, carId: string, cookies: CarnetCookie[] }} SessionOptions */

/**
 *
 * @param {CarnetCookie[]} cookies
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
 * @param {SessionOptions} options
 * @param {typeof defaultLogger} logger
 */
// @ts-ignore
export function validate(options, logger) {
  if (!logger) {
    throw new Error('Missing logger!');
  }

  if (!options) {
    throw new Error('Missing session options!');
  }

  if (!options.carId) {
    throw new Error('Missing "carId" in options!');
  }

  if (!options.csrfToken) {
    throw new Error('Missing "csrfToken" in options!');
  }
}

export default class CarnetAPIClient {

  /**
   *
   * @param {SessionOptions} options
   * @param {typeof defaultLogger?} logger
   */
  // @ts-ignore
  constructor(options, logger = defaultLogger) {
    validate(options, logger);

    this.carId = options.carId;
    this.logger = logger;

    /** @type {{ [x: string]: string }} */
    this.headers = {
      cookie: CarnetAPIClient.cookiesAsString(options.cookies),
      'accept-encoding': 'gzip, deflate, br',
      accept: 'application/json, text/plain, */*',
      'accept-language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json;charset=utf-8',
      pragma: 'no-cache',
      origin: BASE_URL,
      referer: `${DASHBOARD_URL}/${this.carId}`,
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-csrf-token': options.csrfToken,
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'
    };

    logger.debug('CarnetAPIClient() -- headers', this.headers);
  }

  /**
   * Fetch the car details.
   *
   * @return {Promise<{ [x: string]: any }>}
   */
  async loadCarDetails() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/mainnavigation/load-car-details/${this.carId}`;

    this.logger.debug('>> loadCarDetails()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< loadCarDetails() - response', json);

    return json;
  }

  /**
   * Turn on/off electric climate.
   * `setClimat(true)` => on
   * `setClimat(false)` => off
   * @param {boolean} on
   * @return {Promise<{ [x: string]: any }>}
   */
  async triggerClimatisation(on) {
    const url = `${DASHBOARD_URL}/${this.carId}/-/emanager/trigger-climatisation`;

    this.logger.debug('>> triggerClimatisation()');
    const json = await this.triggerAction(url, JSON.stringify({
      triggerAction: true,
      electricClima: on
    }));

    this.logger.debug('<< triggerClimatisation() - response', json);

    return json;
  }

  /**
   * Starts the window heating.
   * @return {Promise<{ [x: string]: any }>}
   */
  async triggerWindowheating() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/emanager/trigger-windowheating`;

    this.logger.debug('>> triggerWindowheating()');
    const json = await this.triggerAction(url, JSON.stringify({
      triggerAction: true
    }));
    this.logger.debug('<< triggerWindowheating() - response', json);

    return json;
  }

  /**
   * Performs a HTTP POST request to the Carnet API.
   *
   * @param {string} url
   * @param {(string | null)?} body
   * @return {Promise<{ [x: string]: any }>}
   */
  async triggerAction(url, body = null) {
    this.logger.debug('>> triggerAction() - url', url);

    const res = await fetch(url, {
      body,
      agent: new https.Agent({
        rejectUnauthorized: false
      }),
      method: 'POST',
      headers: this.headers
    });

    this.logger.debug('<< triggerAction() - status', res.status);

    // TODO: Error handler.
    const json = await res.json();
    if (json.errorCode !== '0') {
      this.logger.warn('ERROR: json', json);
      this.logger.warn('ERROR: code', json.errorCode);
    }

    return json;
  }

  /**
   *
   * @param {CarnetCookie[]} cookies
   */
  static cookiesAsString(cookies) {
    return cookies.map(c => `${c.name}=${c.value};`).join(' ');
  }
}
