# node-vw-carnet

A client that can be used to call the Volkswagen Car-Net API via the <a href="https://www.portal.volkswagen-we.com/portal">We Connect</a> portal. Since Volkswagen does not yet provide an open API, this module can be used as a workaround.

**NOTE**: It can of course break anytime, if Volkswagen changes their We Connect/Car Net portal.

To login and get valid session cookies, <a href="https://github.com/puppeteer/puppeteer">puppeteer</a> is used. The library can be used with either <a href="https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteer-vs-puppeteer-core">puppeteer or puppeteer-core</a>. That's why one of theese modules are needed as a `peerDependency`.


### Installation
```bash
# install puppeteer
npm i puppeteer -S

# (or puppeteer-core)
# npm i puppeteer-core -S

npm i node-vw-carnet -S
```

### Examples

The `main` function in all examples below are called like this:
```javascript
main()
.then(() => process.exit(0))
.catch(err => {
  console.log('ERROR!', err);
  process.exit(1);
});
```

#### With puppeteer

```javascript
import puppeteer from 'puppeteer';
import CarnetLoginHandler from 'node-vw-carnet';
 
async function main() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Create the puppeteer login client by sending in
  // the puppeteer.Page (and a optional logger, can be skipped).
  const handler = new CarnetLoginHandler(page, console);

  // Try to login with your username and password.
  // The login will take ~10 seconds... 
  const client = await handler.createClient({
    email: process.env.EMAIL,
    password: process.env.PASS
  });

  // Close chrome browser since it's not needed anymore.
  await browser.close();

  // Successful login, now use the client.
  // Get car details.
  const details = await client.loadCarDetails();
  console.log('car details:', details);

  // Start the climate heater.
  const response = await client.triggerClimatisation(true);
  console.log('response:', response);
}
```

#### With puppeteer-core

TBD.