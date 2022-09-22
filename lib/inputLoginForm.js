const callback = arguments[arguments.length - 1];
const pw = arguments[0];
const alilangDynamicCode = arguments[1];
(function () {
  setTimeout(() => {
    // 选择跳板机
    document.querySelector('.ant-select-lg.ant-select.ant-select-enabled')
      .click();
    document.querySelector('ul.ant-select-dropdown-menu.ant-select-dropdown-menu-vertical.ant-select-dropdown-menu-root')
      .firstChild.click();

    // 输入用户名
    document.querySelector('input[placeholder="域账号"]').value = 'yitong.cyt';

    // 输入密码
    document.querySelector('input[placeholder="域账号密码"]').value = pw;

    // 输入阿里郎动态秘钥
    document.querySelector('input[placeholder="阿里郎动态密钥"]').value = alilangDynamicCode;

    callback();
  }, 5000)
})();
