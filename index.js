#!/usr/bin/env node

require('chromedriver');
const {
  Builder,
  By,
  Key,
  until,
} = require('selenium-webdriver');
const chrome = require("selenium-webdriver/chrome");
const fs = require('fs');
const path = require('path');
const notifier = require('node-notifier');
const delay = require('await-delay');
const {
  findElementsUntilLocated,
  findElementsWithTextUntilLocated,
} = require('./lib/util');
const chokidar = require('chokidar');

function gitCommitId() {
  try {
    return require('child_process').execSync('git rev-parse HEAD').toString().replace('\n', '');
  } catch (e) {
    return '';
  }
}

function notify(articleName) {
  notifier.notify({
    title: 'sync-csdn-article-markdown',
    message: `articleName ${articleName} build success!`,
    timeout: 3,
    closeLabel: 'close',
  });

  notifier.on('click', function (notifierObject, options, event) {
    process.exit(0);
  });
}

function getOptions(isHeadless, userDataDir, url) {
  const options = new chrome.Options()
    .addArguments(`--user-data-dir=${userDataDir}`)
    .addArguments(`--app=${url}`);
  if (isHeadless) {
    options
      .addArguments('--headless')
      .addArguments('--no-sandbox');
  }
  return options;
}


async function syncArticle(articleInput, articleFilePath) {
  await articleInput.sendKeys(articleFilePath);
}

(async function buildSolution() {
  const articleFileName = process.argv[2];
  const articleName = articleFileName.replace('.md', '');
  const articleListUrl = `https://mp.csdn.net/mp_blog/manage/article`;
  const userDataDir = `${require('os').homedir()}/.sync-csdn-article-markdown/chrome-data`;
  // const isDebug = process.argv[3] === '--debug';
  let options = getOptions(false, userDataDir, articleListUrl);
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const APPLY_DARK_THEME = `
    const callback = arguments[arguments.length - 1];
    (function darkTheme() {
      try {
        // the css we are going to inject
        const css = 'html {filter: invert(85%) hue-rotate(160deg) contrast(1.2);}' +
            'img,video,canvas,bwp-video {filter: invert(100%) hue-rotate(-160deg) contrast(1.0);',
            head = document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
        if (style.styleSheet){
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
        head.appendChild(style);
        callback();
        return null;
      } catch(e) {
        return darkTheme();
      }
    })();
  `;

  try {
    // init
    console.log('Waiting for 3s to login');
    await driver.manage().setTimeouts({ script: 3000000000 });
    await driver.get(articleListUrl);
    await driver.manage().window().maximize();
    try {
      await driver.wait(until.urlIs(articleListUrl), 5000);
    } catch (e) {
      console.log('Session expired, login to csdn.net');
      await driver.quit();
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(getOptions(false, userDataDir, articleListUrl))
        .build();
      await driver.get(articleListUrl);
      await driver.wait(until.urlIs(articleListUrl), 1000000000);
      console.log('You have logged in csdn.net, please retry');
      await driver.quit();
      process.exit(0);
    }

    // theme
    await driver.executeAsyncScript(APPLY_DARK_THEME);

    // find anchor and navigate to
    let articleAnchor;
    while (!articleAnchor) {
      await delay(300);
      console.log('Finding anchor element, ' + articleName);
      articleAnchor = await findElementsWithTextUntilLocated(driver, 'a', articleName);
    }
    console.log('Found anchor element, ' + articleName);
    const articleHref = await articleAnchor.getAttribute('href');
    console.log('Found anchor link, ' + articleHref);
    await driver.get(articleHref);
    await driver.executeAsyncScript(APPLY_DARK_THEME);

    // get local file content
    const articleFilePath = path.join(process.cwd(), articleFileName);
    const localArticleContent = fs.readFileSync(articleFilePath).toString();

    // fill input with content
    let articleInput;
    while (!articleInput) {
      await delay(30);
      console.log('Finding input element, ' + articleName);
      articleInput = await findElementsUntilLocated(driver, 'input#import-markdown-file-input');
    }
    console.log('Found input element, ' + articleName);
    await syncArticle(articleInput, articleFilePath);

    // event loop to watch file changes
    const chokidar = require('chokidar');
    chokidar.watch(articleFilePath).on('all', (event, path) => {
      if (event === 'change') {
        syncArticle(articleInput, articleFilePath).then(e => {
          console.log('Input element synced, ' + articleName);
          notify('Input element synced, ' + articleName);
        });
      }
    });

    // debug
    while (true) {
      await delay(100000000);
    }
    // console.log('Synced, ' + articleName);
    // notify(articleName);
  } finally {
    await driver.quit();
  }
})();
