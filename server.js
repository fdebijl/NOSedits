(() => {
  'use strict';

  require('dotenv').config();

  const moment = require('moment');
  const express = require('express');
  const fs = require('fs');
  const request = require('request');
  const Twit = require('twit');
  const app = express();
  const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET
  });

  app.use(express.json());
  let seenArticles = {};

  // Load config
  let CONFIG;
  CONFIG = JSON.parse(fs.readFileSync('config.json'));
  moment.locale(CONFIG.LOCALE);

  function notifyTitleChanged(article) {
    if (article.titles.length < 2) {
      console.log(`[${moment().format('DD/MM/Y - HH:mm:ss')}] NOSEdits webhook was called without enough titles.`);
      return false;
    }

    if (!seenArticles[article.articleID]) {
      seenArticles[article.articleID] = {
        titles: [],
        lastTweet: null
      }
    }

    if (seenArticles[article.articleID].titles.includes(article.titles[article.titles.length - 1].title)) {
      console.log(`[${moment().format('DD/MM/Y - HH:mm:ss')}] Already tweeted this title for this article.`);
      return false;
    }

    const oldtitle = article.titles[article.titles.length - 2];
    const newtitle = article.titles[article.titles.length - 1];
    const timeDiff = moment(oldtitle.timestamp).from(newtitle.timestamp, true);
    
    let statusText = makeStatusText(
      newtitle.title, 
      oldtitle.title, 
      timeDiff === 'Invalid date' ? '' : `na ${timeDiff} `,
      article.guid || article.link
    );

    let params = { 
      status: statusText
    }

    if (seenArticles[article.articleID].lastTweet) {
      params.status = '@nosedits ' + statusText;
      params.in_reply_to_status_id = seenArticles[article.articleID].lastTweet;
    }

    T.post('statuses/update', params, function (err, data, response) {
      if (err) {
        console.log(`[${moment().format('DD/MM/Y - HH:mm:ss')}] Error!`, err.message);
      } else {
        console.log(`[${moment().format('DD/MM/Y - HH:mm:ss')}] Sent out a tweet: ${statusText}`);
        seenArticles[article.articleID].lastTweet = data.id_str;
      }

      seenArticles[article.articleID].titles.push(article.titles[article.titles.length - 1].title);
    })
  }

  function makeStatusText(newtitle, oldtitle, delay, link,) {
    return `De kop «${oldtitle.trim()}» is ${delay}gewijzigd naar «${newtitle.trim()}» ${link}`;
  }

  String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { 
      return a.toUpperCase(); 
    });
  };

  String.prototype.catStrip = function() {
    return this.replace(/(NOS(\.nl)?)|(nieuws)/gi, '').capitalize().trim();
  }

  module.exports = {
    notifyTitleChanged: notifyTitleChanged,
    makeStatusText: makeStatusText,
    capitalize: String.prototype.capitalize,
    catStrip: String.prototype.catStrip
  }

  app.post('/notify', (req, res) => {
    if (typeof(req.body) != 'object') {
      req.body = JSON.parse(req.body);
    }

    notifyTitleChanged(req.body);
    res.sendStatus(200);
  })

  app.listen(7676);
})();