const Parser = require('rss-parser'),
      parser = new Parser(),
      fs = require('fs');

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

(async function() {
  let fullfeed = [];

  try {
    fs.unlinkSync('../test/feed.json');
    fs.unlinkSync('../test/feed_with_changes.json');
  } catch (e) {
    // Lol
  }

  for (FEEDINDEX in FEEDS) {
    let feed = await parser.parseURL(ROOT + FEEDS[FEEDINDEX]);
    fullfeed.push(...feed.items);
  }

  fs.writeFileSync("../test/feed.json", JSON.stringify(fullfeed, null, 4));

  for (let index = 0; index < fullfeed.length; index++) {
    if (Math.random() < 0.10) {
      let item = fullfeed[index];
      item.title = "Terry Crews: '" + item.title + "'";
      fullfeed[index] = item;
    }
  }

  fs.writeFileSync("../test/feed_with_changes.json", JSON.stringify(fullfeed, null, 4));
})();