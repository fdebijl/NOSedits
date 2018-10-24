# [NOSedits](https://twitter.com/nosedits)
Track changes to titles in NOS articles

### How does it work?
The NOS RSS feeds are retrieved and parsed into an object. Every entry in the feed is saved into a variable of 'seen' articles.
Every 30 seconds the script will then retrieve the feed again and compare the new titles for every link with the 'seen' titles (i.e, the titles from the last cycle).
If the titles differ, the script will issue a Tweet with both the old and the new title.

### Building
```sh
npm install
npm start
```

Alternatively you can use the pm2 process manager
```sh
# Install PM2 if you haven't done so yet
npm install pm2 -g
pm2 start galgje.config.js
```

### Contributing
Yes please