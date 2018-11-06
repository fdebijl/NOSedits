require('dotenv').config();

const Parser = require('rss-parser'),
      moment = require('moment'),
      fs = require('fs'),
      Twit = require('twit'),
      StatsD = require('hot-shots');

const parser = new Parser();
const T = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});
const telemetry = new StatsD({
  prefix: "nosedits-"
});

// Load config
let CONFIG;
CONFIG = JSON.parse(fs.readFileSync('config.json'));
let NO_TELEMETRY = CONFIG.NO_TELEMETRY;

// The collection of articles
let articles = [];

setInterval(() => {
  retrieveArticles();
}, CONFIG.SCRAPER_INTERVAL * 1000)

setInterval(() => {
  purgeArticles();
}, CONFIG.PURGE_INTERVAL * 60 * 60 * 1000);

setInterval(() => {
  // Ping the telemetry server every TELEMETRY_INTERVAL seconds so it knows we're still alive
  telemetry.check('service.up', telemetry.CHECKS.OK);
  
  // Count the number of articles from each category
  for (FEEDINDEX in CONFIG.FEEDS) {
    let category = CONFIG.FEEDS[FEEDINDEX].catStrip();
    let inCategoryCount = articles.filter(article => {
      return article.category == category;
    });
    
    telemetry.histogram(category, inCategoryCount.length);
  }
}, CONFIG.TELEMETRY_INTERVAL * 1000);

// Main loop - check for new articles in all feeds
async function retrieveArticles() {
  let totalLength = 0;

  for (FEEDINDEX in CONFIG.FEEDS) {
    let feed = await parser.parseURL(CONFIG.ROOT + CONFIG.FEEDS[FEEDINDEX]);
    let category = feed.title.catStrip();
    totalLength = totalLength + feed.items.length;
    feed.items.forEach(item => {
      // Only proceed if category is present
      if (category) {
        checkArticleForNewTitle(item, category);
      }
    });
  }
  
  telemetry.histogram('article_count', articles.length);
  telemetry.histogram('feeditems_count', totalLength);
}

function checkArticleForNewTitle(newArticle, injectCategory) {
  // Inject category so we can display it later
  newArticle.category = injectCategory

  // Article exists, check if title has changed since the last time we saw it
  let existingArticle = articles.find(article => {
    return (article.guid == newArticle.guid && article.category == newArticle.category);
  });

  if (!!existingArticle) {
    if ((existingArticle.title != newArticle.title) && (existingArticle.category == newArticle.category)) {
      // Title has changed, send out a Tweet
      notifyTitleChanged(newArticle, existingArticle); 
    }

    // Title hasn't changed and we already have the article in our collection
    telemetry.increment('article_stale');
  } else {
    // New (unseen) article, add it to our collection
    articles.push(newArticle);
    telemetry.increment('article_new');
  }
}

// Send tweet that the title of an article has changed
function notifyTitleChanged(newArticle, existingArticle) {
  telemetry.increment('article_changed');
  let params, statusText = makeStatusText(newArticle, existingArticle);

  // Reply to previous Tweet about this title, if it exists
  if (existingArticle.tweetID) {
    params = { 
      status: CONFIG.USERNAME + statusText,
      in_reply_to_status_id: existingArticle.tweetID
    }
  } else {
    params = { 
      status: statusText
    }
  }

  T.post('statuses/update', params, function (err, data, response) {
    if (err) {
      if (err.code)
      console.log('Error!', err.message);
      telemetry.event('Status update failed', `Error ${err.code}: ${err.message}`);
      telemetry.check("tweet_result", telemetry.CHECKS.WARNING);
      telemetry.increment('error_rate');
    } else {
      newArticle.tweetID = response.id_str;
      telemetry.check("tweet_result", telemetry.CHECKS.OK);
      console.log(`Sent out a tweet: ${statusText} -- Oldcat: ${existingArticle.source}, newcat: ${newArticle.source}`);
      // Set old article to new info, otherwise the article would trigger notifyTitleChanged again in the next cycle
      console.log(`Replacing article at index ${articles.indexOf(existingArticle)} in collection.`);
      articles[articles.indexOf(existingArticle)] = newArticle;
    }
  })
}

function purgeArticles() {
  // Retain articles only when they're no older than 48 hours
  let rightNow = moment(), countPurged = 0, total = articles.length;
  let twoDaysAgo = rightNow.subtract(CONFIG.PURGE_TRESHOLD, "hours");
  
  articles.filter(article => {
    let theDateThisWasPublished = moment(article.pubDate);
    let isTooOld = theDateThisWasPublished.isBefore(twoDaysAgo, "hour");
    if (isTooOld) countPurged++;
    return !isTooOld;
  });

  telemetry.histogram("count_purged", countPurged);
  console.log(`Purged ${countPurged} articles (${Math.floor(countPurged / total * 100)}%)`)
}

function makeStatusText(newArticle, existingArticle) {
  let cat = newArticle.category ? '[' + newArticle.category + '] ' : '';
  return `${cat}De kop «${existingArticle.title.trim()}» is zojuist gewijzigd naar «${newArticle.title.trim()}» ${newArticle.guid}`;
}

String.prototype.capitalize = function() {
  return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

String.prototype.catStrip = function() {
  return this.replace(/(NOS(\.nl)?)|(nieuws)/gi, '').capitalize().trim();
}

module.exports = {
  retrieveArticles: retrieveArticles,
  purgeArticles: purgeArticles,
  checkArticleForNewTitle: checkArticleForNewTitle,
  notifyTitleChanged: notifyTitleChanged,
  purgeArticles: purgeArticles,
  makeStatusText: makeStatusText,
  capitalize: String.prototype.capitalize,
  catStrip: String.prototype.catStrip
}