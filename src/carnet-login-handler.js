import CarnetAPIClient from './carnet-api-client';
import { defaultLogger } from './utils';
import { LOGIN_PAGE_URL } from './constants';

/** @typedef {{ email: string, password: string }} CarnetUserCredentials */


export default class CarnetLoginHandler {

  /**
   *
   * @param {import('puppeteer').Page} page
   * @param {typeof defaultLogger?} logger
   */
  // @ts-ignore
  constructor(page, logger = defaultLogger) {
    this.page = page;
    this.logger = logger;
  }

  /**
   *
   * @param {CarnetUserCredentials} credentials
   * @return {Promise<CarnetAPIClient>}
   */
  async createClient(credentials) {
    if (!credentials.email) {
      throw new Error('missing required property "email" in credentials');
    }

    if (!credentials.password) {
      throw new Error('missing required property "password" in credentials');
    }

    await this.navigateToLoginPage();

    return this.login(credentials);
  }

  /**
   * @private
   */
  async navigateToLoginPage() {
    const { page, logger } = this;

    logger.debug('>> navigateToLoginPage() - navigate to login page', LOGIN_PAGE_URL);
    await page.goto(LOGIN_PAGE_URL);

    await page.click('#loginButtonWelcomeScreen');
    await page.waitForSelector('#input_email');

    logger.debug('<< navigateToLoginPage() - navigated to login page');
  }

  /**
   * @private
   */
  async login(credentials) {
    const { page, logger } = this;

    logger.debug('>> login() - trying to login');

    await page.type('#input_email', credentials.email);

    logger.debug('-- login() - typed in email, click next');
    await page.click('#next-btn');

    await page.waitForSelector('#input_password_for_login');
    await page.type('#input_password_for_login', credentials.password);

    logger.debug('-- login() - typed in password, click next');
    await page.click('#next-btn');

    logger.debug('-- login() - waiting for response...');
    const response = await page.waitForNavigation({ waitUntil: 'networkidle0' });

    const csrfToken = await page.$eval('meta[name=_csrf', meta => meta.getAttribute('content'));

    logger.debug('-- login() - csrfToken:', csrfToken.toString());
    logger.debug('-- login() -- url', response.url());
    const cookies = await page.cookies();
    const [, carIdentifier] = response.url().split('dashboard/');

    return new CarnetAPIClient({
      carId: carIdentifier,
      csrfToken: csrfToken.toString(),
      cookies
    }, this.logger);
  }
}
