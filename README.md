# [NOSedits](https://twitter.com/nosedits)
Track changes to titles in NOS articles
<br><br>
### How does it work?
The NOS RSS feeds are retrieved and parsed into an object. Every entry in the feed is saved into a variable of 'seen' articles.
Every 30 seconds the script will then retrieve the feed again and compare the new titles for every link with the 'seen' titles (i.e, the titles from the last cycle).
If the titles differ, the script will issue a Tweet with both the old and the new title.
<br><br>
### Building
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
<br><br>
### Contributing
Yes please, just make sure the tests still pass.