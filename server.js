/* Setting things up. */
require('dotenv').config();

const Parser = require('rss-parser'),
      parser = new Parser(),
      fs = require('fs'),
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
articles = [];

retrieveAndCheckArticles();
setInterval(() => {
  retrieveAndCheckArticles();
}, 30 * 1000)

// Main loop - check for new articles in all feeds
async function retrieveAndCheckArticles() {
  console.log("======================================================================")
  let items = [];

  // Aggregate all NOS feeds into one array of items
  for (FEEDINDEX in FEEDS) {
    console.log("Gathering RSS feed " + FEEDS[FEEDINDEX]);
    let feed = await parser.parseURL(ROOT + FEEDS[FEEDINDEX]);
    items.push(...feed.items);
  }

  items.forEach(item => {
    let existingArticleIndex;

    // Article exists, check if title has changed since the last time we saw it
    let existingArticle = articles.find((article, index, array) => {
      existingArticleIndex = index;
      return article.guid == item.guid;
    });

    if (!!existingArticle) {
      if (existingArticle.title != item.title) {
        // Title has changed, send out a Tweet
        notifyTitleChanged(item, existingArticle);

        // Set old article to new info
        articles[existingArticleIndex] = item;
      }
      // Title hasn't changed and we already have the article in our collection
    } else {
      // New item, add it to our collection
      articles.push(item);
    }
  });
}

// Send tweet that the title of an article has changed
function notifyTitleChanged(newArticle, existingArticle) {
  let statusText = `De kop "${existingArticle.title}" is zojuist gewijzigd naar "${newArticle.title}" ${newArticle.guid}`;
  let params = { 
    status: statusText
  }

  T.post('statuses/update', params, function (err, data, response) {
    if (err){
      console.log('Error!', err);
    } else {
      console.log("Send out a tweet!");
    }
  })
}

// Clean $articles from items that are older than 2 days
function purgeArticles() {
  // TODO
}

// Item structure:
// Title
// Link
// Description
// Enclosure (image)
// Pubdate
// guid (permalink)