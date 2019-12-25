# node-vw-carnet

A client that can be used to call the Volkswagen Car-Net API via the <a href="https://www.portal.volkswagen-we.com/portal">We Connect</a> portal. Since Volkswagen does not yet provide an open API, this module can be used as a workaround.


**NOTE**: This library will break when Volkswagen changes their We Connect/Car-Net portal.

To login and get valid session cookies, <a href="https://github.com/puppeteer/puppeteer">puppeteer</a> is used. The library can be used with either <a href="https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteer-vs-puppeteer-core">puppeteer or puppeteer-core</a>.

### Example
Here is an <a href="https://github.com/nekman/node-vw-carnet-lambda">example</a> where this library is used in a REST API on a AWS Lambda.


## Installation
```bash
# install puppeteer
npm i puppeteer -S

# (or puppeteer-core)
# npm i puppeteer-core -S

npm i node-vw-carnet -S
```

### Usage

The `main` function in all examples below are called like this:
```javascript
main()
.then(() => process.exit(0))
.catch(err => {
  console.log('ERROR!', err);
  process.exit(1);
});
```

#### Login
It takes a long time to log in (normally around 5-20 seconds). The reason is that the We-Connect portal takes some time to respond. Once the login is complete, you can save the `CarnetAPIClient` instance (or information) and call the Car-Net API directly (this is done with <a href="https://github.com/bitinn/node-fetch">node-fetch</a>) and the responses from these calls are usually quick.


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
    email: process.env.EMAIL, // your carnet email
    password: process.env.PASS // your carnet password
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

```javascript
import puppeteer from 'puppeteer-core';
import CarnetLoginHandler from 'node-vw-carnet';

async function main() {
  const browser = await puppeteer.launch({  
    executablePath: '<path to chrome>' // /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome
  });

  // ...
}
```

### Available client methods

The following methods are available on the `CarnetAPIClient`. All methods
returns `Promise<CarNetJSONResponse>`

```typescript
interface CarNetJSONRespose {
  [x: string]: any;
  // If errorCode is '0' the request was successfull
  errorCode: string;
}
```

```typescript
getLocation()
getFullyLoadedCars()
getCompleteVehicleJson()
loadCarDetails()
triggerClimatisation(on: boolean)
triggerWindowheating()
getPSPStatus()
getVehicleDetails()
getVehicleStatusReport()
getLatestReport()
getEmanager()
getLatestTripStatistics()
// Can be used if this library have missed a certain method.
triggerAction(url, body = null)
```

### Building

```bash
# clone this repo
git clone https://github.com/nekman/node-vw-carnet.git

# install dependencies
npm i

# lint
npm run eslint

# manual test
EMAIL=<your carnet email> PASS=<your carnet pass> npm run manual:test
```

### Q: Why puppeteer?
A: Easier to login to the We Connect Portal. I can of course do like other <a href="https://github.com/reneboer/python-carnet-client/blob/master/we_connect_client.py#L105">libraries and perform all required login steps</a>, but next time Volkswagen changes their We Connect portal a new time consuming login procedure needs to be implemented. Changes will be easier to handle with Puppeteer.