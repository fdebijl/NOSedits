require('dotenv').config();

const Parser = require('rss-parser'),
      parser = new Parser(),
      moment = require('moment'),
      Twit = require('twit'),
      config = {
        twitter: {
          consumer_key: process.env.CONSUMER_KEY,
          consumer_secret: process.env.CONSUMER_SECRET,
          access_token: process.env.ACCESS_TOKEN,
          access_token_secret: process.env.ACCESS_TOKEN_SECRET
        }
      };

const T = new Twit(config.twitter);
const StatsD = require('hot-shots');
let dd_options = {
  prefix: "nosedits-"
};
const telemetry = new StatsD(dd_options);

const SCRAPER_INTERVAL = 30; //seconds
const TELEMETRY_INTERVAL = 120; //seconds
const PURGE_INTERVAL = 24; //hours
const PURGE_TRESHOLD = 48; //hours

// All NOS feeds to cycle through to 
const ROOT = "http://feeds.nos.nl/";
const FEEDS = [
  "nosnieuwsbinnenland"
  ,"nosnieuwsalgemeen"
  ,"nosnieuwsbuitenland"
  ,"nosnieuwspolitiek"
  ,"nosnieuwseconomie"
  ,"nosnieuwscultuurenmedia"
  ,"nosnieuwstech"
  ,"nosnieuwskoningshuis"
];

// Maintain a collection of all articles
let articles = [];



// Run the article scraper every SCRAPER_INTERVAL seconds
retrieveAndCheckArticles();
setInterval(() => {
  retrieveAndCheckArticles();
}, SCRAPER_INTERVAL * 1000)

// Run The Purge (2013) every PURGE_INTERVAL hours
setInterval(() => {
  purgeArticles();
}, PURGE_INTERVAL * 60 * 60 * 1000);

// Ping the telemetry server every TELEMETRY_INTERVAL seconds so it knows we're still alive
setInterval(() => {
  telemetry.check('service.up', telemetry.CHECKS.OK);
}, TELEMETRY_INTERVAL * 1000);



// Main loop - check for new articles in all feeds
async function retrieveAndCheckArticles() {
  console.log("======================================================================")
  let items = [];

  // Aggregate all NOS feeds into one array of items
  for (FEEDINDEX in FEEDS) {
    console.log(`Gathering RSS feed ${FEEDS[FEEDINDEX]}`);
    let feed = await parser.parseURL(ROOT + FEEDS[FEEDINDEX]);
    telemetry.histogram(FEEDS[FEEDINDEX], feed.items.length);
    items.push(...feed.items);
  }

  // Remove duplicates and ping telemetry with the amount of articles we encountered
  items = removeDuplicatesFrom(items);
  telemetry.histogram('feeditem_count', items.length);

  items.forEach(item => {
    // Article exists, check if title has changed since the last time we saw it
    let existingArticle = articles.find((article, index, array) => {
      return article.guid == item.guid;
    });

    if (!!existingArticle) {
      if (existingArticle.title != item.title) {
        // Title has changed, send out a Tweet
        notifyTitleChanged(item, existingArticle);

        // Set old article to new info, otherwise the article would trigger notifyTitleChanged again in the next cycle
        console.log(`Replacing article at index ${articles.indexOf(existingArticle)} in collection.`)
        articles[articles.indexOf(existingArticle)] = item;
      }

      // Title hasn't changed and we already have the article in our collection
      telemetry.increment('article_stale');
    } else {
      // New item, add it to our collection
      articles.push(item);
      telemetry.increment('article_new');
    }
  });

  afterCheck();
}

// Send tweet that the title of an article has changed
function notifyTitleChanged(newArticle, existingArticle) {
  telemetry.increment('article_changed');
  let statusText = `De kop "${existingArticle.title.trim()}" is zojuist gewijzigd naar "${newArticle.title.trim()}" ${newArticle.guid}`;
  let params = { 
    status: statusText
  }

  T.post('statuses/update', params, function (err, data, response) {
    if (err) {
      if (err.code)
      console.log('Error!', err.message);
      telemetry.event('Edit Tweet Failed', JSON.stringify(err, null, 4));
      telemetry.check("tweet_result", telemetry.CHECKS.WARNING);
      telemetry.increment('error_rate');
    } else {
      telemetry.check("tweet_result", telemetry.CHECKS.OK);
      console.log(`Sent out a tweet: ${statusText}`);
    }
  })
}



function purgeArticles() {
  // Retain articles only when they're no older than 48 hours
  let rightNow = moment(), countPurged = 0, total = articles.length;
  let twoDaysAgo = rightNow.subtract(2, "days");
  
  articles.filter(article => {
    let theDateThisWasPublished = moment(article.pubDate);
    let isTooOld = theDateThisWasPublished.isBefore(twoDaysAgo, "hour");
    if (isTooOld) countPurged++;
    return !isTooOld;
  });

  telemetry.histogram("count_purged", countPurged);
  console.log(`Purged ${countPurged} articles (${Math.floor(countPurged / total * 100)}%)`)
}

function afterCheck() {
  // Update article count
  telemetry.histogram('article_count', articles.length);
  articles = removeDuplicatesFrom(articles);
}

function removeDuplicatesFrom(array) {
  let seen = {};
  return array.filter(function(item) {
      return array.hasOwnProperty(item.guid) ? false : (seen[item.guid] = true);
  });
}