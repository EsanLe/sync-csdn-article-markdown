# sync-csdn-article-markdown

Features:

* Write csdn article in markdown format with local editor such as Vim, Visual Code, Emacs
  * Currently local filename (without .md extension) must equals to remote article name, which is hard coded, so that the tool can match the remote article
* Preview using csdn offical previewer on the fly
* Custom dark theme (currently hard coded)

Screenshot:

![](https://github.com/eddiechen1008/sync-csdn-article-markdown/raw/master/screenshot/vim-csdn.jpeg)

## install

### install from github repo

```
git clone 
cd sync-csdn-article-markdown
npm install -g
```

### install from npm offical repo (todo)

```
npm install -g sync-csdn-article-markdown
```

## usage

### enable markdown format

* go to [发布文章](https://mp.csdn.net/mp_blog/creation/editor) and click back

![](https://github.com/eddiechen1008/sync-csdn-article-markdown/raw/master/screenshot/create-article.jpeg)

* click "Markdown编辑器" to enable markdown format as default

![](https://github.com/eddiechen1008/sync-csdn-article-markdown/raw/master/screenshot/create-markdown.jpeg)

* create a article which title is exact match the local file (without .md extension)

* create a local .md file with name `<article-name>.md`


### login csdn only for once

terminal command:

```
sync-csdn-article-markdown <article-name>.md
```

login csdn with any method

![](https://github.com/eddiechen1008/sync-csdn-article-markdown/raw/master/screenshot/vim-csdn.jpeg)

terminal stdout:
```
Waiting for 3s to login
Session expired, login to csdn.net
You have logged in csdn.net, please retry
```

### sync local file with remote previewer

terminal command:

```
sync-csdn-article-markdown <article-name>.md
```

save local file and preview using remote previewer

![]()

## troubleshooting

### after upgrade chrome

reinstall the package or followings:

```
chromedriver
selenium-webdriver
```

### clear chrome data

```
rm -rf ~/.sync-csdn-article-markdown
```
