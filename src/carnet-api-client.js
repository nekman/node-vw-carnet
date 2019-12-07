import fetch from 'node-fetch';
import https from 'https';
import { defaultLogger } from './utils';
import * as Validation from './validation';
import { BASE_URL, DASHBOARD_URL } from './constants';

/** @typedef {{ name: string, value: string }} CarnetCookie */
/** @typedef {{ csrfToken: string, carId: string, cookies: CarnetCookie[] }} SessionOptions */
/** @typedef {{ errorCode: string, [x: string]: any }} CarnetJSONResponse */

/**
 * @private
 * @param {CarnetCookie[]} cookies
 */
function cookiesAsString(cookies) {
  return cookies.map(c => `${c.name}=${c.value};`).join(' ');
}

/**
 * The Carnet API client.
 */
export default class CarnetAPIClient {

  /**
   *
   * @param {SessionOptions} options
   * @param {typeof defaultLogger?} logger
   */
  // @ts-ignore
  constructor(options, logger = defaultLogger) {
    Validation.validate(options, logger);

    // expose so options so it's possible to
    // use from other clients if needed.
    this.options = options;

    this.carId = options.carId;
    this.logger = logger;

    /** @type {{ [x: string]: string }} */
    this.headers = {
      cookie: cookiesAsString(options.cookies),
      pragma: 'no-cache',
      origin: BASE_URL,
      referer: `${DASHBOARD_URL}/${this.carId}`,
      accept: 'application/json, text/plain, */*',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7',
      'cache-control': 'no-cache',
      'content-type': 'application/json;charset=utf-8',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'x-csrf-token': options.csrfToken,
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.70 Safari/537.36'
    };

    logger.debug('CarnetAPIClient() -- headers', this.headers);
  }

  /**
   * Get the car location (lat, lon).
   *
   * @return {Promise<CarnetJSONResponse>}
   */
  async getLocation() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/cf/get-location`;

    this.logger.debug('>> getLocation()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getLocation() - response', json);

    return json;
  }

  /**
   * Get the fully loaded car info (?).
   *
   * @return {Promise<CarnetJSONResponse>}
   */
  async getFullyLoadedCars() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/mainnavigation/get-fully-loaded-cars`;

    this.logger.debug('>> getFullyLoadedCars()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getFullyLoadedCars() - response', json);

    return json;
  }

  /**
   * Get the complete vehicle JSON.
   *
   * @return {Promise<CarnetJSONResponse>}
   */
  async getCompleteVehicleJson() {
    const url = `${DASHBOARD_URL}/${this.carId}`;

    this.logger.debug('>> getCompleteVehicleJson()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getCompleteVehicleJson() - response', json);

    return json;
  }

  /**
   * Load the car details.
   *
   * @return {Promise<CarnetJSONResponse>}
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
   *
   * @param {boolean} on If `true` start, if `false` stop climate heating.
   * @return {Promise<CarnetJSONResponse>}
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
   * @return {Promise<CarnetJSONResponse>}
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
   * Get the vehicle details.
   * @return {Promise<CarnetJSONResponse>}
   */
  async getPSPStatus() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/mainnavigation/get-psp-status`;

    this.logger.debug('>> getPSPStatus()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getPSPStatus() - response', json);

    return json;
  }

  /**
   * Get the vehicle details.
   * @return {Promise<CarnetJSONResponse>}
   */
  async getVehicleDetails() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/vehicle-info/get-vehicle-details`;

    this.logger.debug('>> getVehicleDetails()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getVehicleDetails() - response', json);

    return json;
  }

  /**
   * Get the vehicle status data.
   * @return {Promise<CarnetJSONResponse>}
   */
  async getVehicleStatusReport() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/vsr/get-vsr`;

    this.logger.debug('>> getVehicleStatusReport()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getVehicleStatusReport() - response', json);

    return json;
  }

  /**
   * Get latest vehicle report.
   * @return {Promise<CarnetJSONResponse>}
   */
  async getLatestReport() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/vhr/get-latest-report`;

    this.logger.debug('>> getLatestReport()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getLatestReport() - response', json);

    return json;
  }

  /**
   * Get e-manager info.
   * @return {Promise<CarnetJSONResponse>}
   */
  async getEmanager() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/emanager/get-emanager`;

    this.logger.debug('>> getEmanager()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getEmanager() - response', json);

    return json;
  }

  /**
   * Get statistics about the latest trip.
   * @return {Promise<CarnetJSONResponse>}
   */
  async getLatestTripStatistics() {
    const url = `${DASHBOARD_URL}/${this.carId}/-/rts/get-latest-trip-statistics`;

    this.logger.debug('>> getLatestTripStatistics()');
    const json = await this.triggerAction(url);
    this.logger.debug('<< getLatestTripStatistics() - response', json);

    return json;
  }

  /**
   * Performs a HTTP POST request to the Carnet API.
   *
   * @param {string} url
   * @param {(string | null)?} body
   * @return {Promise<CarnetJSONResponse>}
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

}
