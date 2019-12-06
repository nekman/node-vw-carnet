import puppeteer from 'puppeteer';
import CarnetLoginHandler from '../main';

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
  await client.triggerClimatisation(true);

  await client.getEmanager();
  await client.getLatestReport();
  await client.getLatestTripStatistics();
  await client.getPSPStatus();
  await client.getVehicleDetails();
  await client.getVehicleStatusReport();
  await client.getLocation();
}


main()
.then(() => process.exit(0))
.catch(err => {
  console.log('ERROR!', err);
  process.exit(1);
});
