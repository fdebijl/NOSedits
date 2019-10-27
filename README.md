# [NOSedits](https://twitter.com/nosedits)
Track changes to titles in NOS articles
<br><br>
### How does it work?
NOSEdits receives title changes from [OpenTitles](https://github.com/Fdebijl/OpenTitles.Scraper) via webhooks. These are checked for validity, once they pass all the tests a tweet is issued that the title has been changed.

<br><br>
### Contributing
```sh
npm install
npm start
```

Alternatively you can use the pm2 process manager
```sh
# Install PM2 if you haven't done so yet
npm install pm2 -g
pm2 start nosedits.config.js
```

You will need a set of API keys from Twitter in order to actually send out a Tweet when a changed title is detected. You can get these from the [Twitter Developer](https://developer.twitter.com/en/apply-for-access) site. Put these in the `.envtemplate` and rename this file to `.env`.
<br><br>
### Testing
```sh
npm install
npm test
```

A report will be outputed to `/test/report`
