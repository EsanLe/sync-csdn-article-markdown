const {
  By,
  until,
} = require('selenium-webdriver');

async function findElementsUntilLocated(driver, selector) {
  try {
    await driver.wait(until.elementLocated(By.css(selector)));
    const elementList = await driver.findElements(By.css(selector));
    return elementList[0];
  } catch (e) {

  }
  return [];
}

async function findElementsWithTextUntilLocated(driver, selector, text) {
  try {
    await driver.wait(until.elementLocated(By.css(selector)));
    const eleList = await driver.findElements(By.css(selector));
    for (let i = 0; i < eleList.length; i++) {
      const eleText = await eleList[i].getText();
      if (eleText === text) {
        return eleList[i];
      }
    }
  } catch (e) {}
  return null;
}


module.exports = {
  findElementsUntilLocated,
  findElementsWithTextUntilLocated,
};
