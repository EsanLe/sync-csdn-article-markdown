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
const notifier = require('node-notifier');

function gitCommitId() {
  try {
    return require('child_process').execSync('git rev-parse HEAD').toString().replace('\n', '');
  } catch (e) {
    return '';
  }
}

function notify(solutionId) {
  notifier.notify({
    title: 'tpp-solution-auto-build',
    message: `solutionId ${solutionId} build success!`,
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

(async function buildSolution() {
  const solutionId = process.argv[2];
  // const solutionUrl = `https://tppnext.alibaba-inc.com/solution/${solutionId}/dashboard`;
  const solutionUrl = `https://tppnext.alibaba-inc.com/web/v1/scenes/solution/${solutionId}?step=pre&tab=meta`;
  const userDataDir = `${require('os').homedir()}/.tpp-solution-auto-build/chrome-data`;
  const isDebug = process.argv[3] === '--debug';
  let options = getOptions(!isDebug, userDataDir, solutionUrl);
  let driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  const GET_COMMIT_ID = `
    function getCommitId() {
      try {
        return Array.from(document.querySelectorAll('span'))
          .filter(item => item.className.indexOf('commitId') > -1)
          .pop().innerText;
      } catch(e) {
        return getCommitId();
      }
    }
  `;
  const CALL_GET_COMMIT_ID = `
    ${GET_COMMIT_ID}
    const callback = arguments[arguments.length - 1];
    setTimeout(() => {
      callback(getCommitId());
    }, 500);
  `;
  const BUILD_CLICK = `
    try {
      const callback = arguments[arguments.length - 1];

      // 兜底超时
      // 当进入某些页面时候卡顿，刷新页面
      setTimeout(() => {
        try {
          Array.from(document.querySelectorAll('button')).filter(item => item.innerText.contains('跳过')).pop().click();
          Array.from(document.querySelectorAll('a')).filter(item => item.innerText.contains('跳过')).pop().click();
        } catch (e) {}
      }, 8000);

      (function () {
        let building = false;
        let interval = setInterval(() =>{
          const btn = Array.from(document.querySelectorAll('button'))
            .filter(item => item.innerText === '预发发布' || item.innerText === '重新发布' || item.innerText === '知道了' || item.innerText === '确 定').pop();
          if (!btn.disabled) {
            if (!building) {
              btn.click();
              building = true;
            } else {
              if (!document.querySelector('.next-icon-loading')) {
                // 确保 loading 结束
                clearInterval(interval);
                setTimeout(() => callback(), 300);
              }
            }
          } else if (!building) {
            const cancelBtn = Array.from(document.querySelectorAll('button'))
              .filter(item => item.innerText === '取消编译').pop();
            if (cancelBtn) {
              cancelBtn.click();
            }
          }
        }, 1000);
      })();
    } catch(e) {}
  `;

  try {
    // init
    console.log('Waiting for 3s to login');
    await driver.manage().setTimeouts({ script: 3000000000 });
    await driver.get(solutionUrl);
    try {
      await driver.wait(until.urlIs(solutionUrl), 5000);
    } catch (e) {
      console.log('Session expired, login to alibaba-inc.com');
      await driver.quit();
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(getOptions(false, userDataDir, solutionUrl))
        .build();
      await driver.get(solutionUrl);
      await driver.wait(until.urlIs(solutionUrl), 1000000000);
      console.log('You have logged in alibaba-inc.com, please retry');
      await driver.quit();
      process.exit(0);
    }

    // init state
    let localCommitId = gitCommitId({ cwd: process.cwd() });
    let remoteCommitId = await driver.executeAsyncScript(CALL_GET_COMMIT_ID);
    console.log('Local commit id:', localCommitId || 'empty, force rebuild');

    // biz
    while (localCommitId !== remoteCommitId) {
      console.log(`Not Synced, remote commit id: ${remoteCommitId}, building`);
      await driver.executeAsyncScript(BUILD_CLICK);
      remoteCommitId = await driver.executeAsyncScript(CALL_GET_COMMIT_ID);
      if (!localCommitId) {
        localCommitId = remoteCommitId;
      }
      console.log('Remote commit id:', remoteCommitId);
    }
    console.log('Synced, not need to build');
    notify(solutionId);
  } finally {
    await driver.quit();
  }
})();
