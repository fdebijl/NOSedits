const assert = require('assert').strict;
const fs = require('fs');
const server = require('../server.js');
let controlfeed, changedfeed;

let controlitem = {
  "title": "Nu merken we pas écht hoe gortdroog de zomer was",
  "link": "http://feeds.nos.nl/~r/nosnieuwsbinnenland/~3/P7voC-07THY/2256743",
  "pubDate": "Sun, 28 Oct 2018 09:54:22 +0100",
  "enclosure": {
      "type": "image/jpeg",
      "url": "https://nos.nl/data/image/2018/10/28/509210/320x320.jpg"
  },
  "content": "<p>Het was droog deze zomer. Extreem droog, maar nog net geen record. Die eer gaat naar de zomer van 1976. Maar dit jaar zijn er dezelfde problemen. Boeren kunnen minder oogsten, schippers kunnen door het lage water veel minder vervoeren en ook de natuur kreeg rake klappen.</p>\r\n<p>NOS op 3 legt in de video hierboven met animaties uit wat de droogte van 2018 betekent. En melkveehouder Maurice, binnenvaartschipper Floris en boswachter Tim vertellen hoe zij door de droogte zijn geraakt. </p><img src=\"http://feeds.feedburner.com/~r/nosnieuwsbinnenland/~4/P7voC-07THY\" height=\"1\" width=\"1\" alt=\"\"/>",
  "contentSnippet": "Het was droog deze zomer. Extreem droog, maar nog net geen record. Die eer gaat naar de zomer van 1976. Maar dit jaar zijn er dezelfde problemen. Boeren kunnen minder oogsten, schippers kunnen door het lage water veel minder vervoeren en ook de natuur kreeg rake klappen.\r\nNOS op 3 legt in de video hierboven met animaties uit wat de droogte van 2018 betekent. En melkveehouder Maurice, binnenvaartschipper Floris en boswachter Tim vertellen hoe zij door de droogte zijn geraakt.",
  "guid": "https://nos.nl/l/2256743",
  "isoDate": "2018-10-28T08:54:22.000Z",
  "itunes": {},
  "category": "Binnenlands"
};

let changeditem = {
  "title": "Deze zomer was verdomd droog lmao",
  "link": "http://feeds.nos.nl/~r/nosnieuwsbinnenland/~3/P7voC-07THY/2256743",
  "pubDate": "Sun, 28 Oct 2018 09:54:22 +0100",
  "enclosure": {
      "type": "image/jpeg",
      "url": "https://nos.nl/data/image/2018/10/28/509210/320x320.jpg"
  },
  "content": "<p>Het was droog deze zomer. Extreem droog, maar nog net geen record. Die eer gaat naar de zomer van 1976. Maar dit jaar zijn er dezelfde problemen. Boeren kunnen minder oogsten, schippers kunnen door het lage water veel minder vervoeren en ook de natuur kreeg rake klappen.</p>\r\n<p>NOS op 3 legt in de video hierboven met animaties uit wat de droogte van 2018 betekent. En melkveehouder Maurice, binnenvaartschipper Floris en boswachter Tim vertellen hoe zij door de droogte zijn geraakt. </p><img src=\"http://feeds.feedburner.com/~r/nosnieuwsbinnenland/~4/P7voC-07THY\" height=\"1\" width=\"1\" alt=\"\"/>",
  "contentSnippet": "Het was droog deze zomer. Extreem droog, maar nog net geen record. Die eer gaat naar de zomer van 1976. Maar dit jaar zijn er dezelfde problemen. Boeren kunnen minder oogsten, schippers kunnen door het lage water veel minder vervoeren en ook de natuur kreeg rake klappen.\r\nNOS op 3 legt in de video hierboven met animaties uit wat de droogte van 2018 betekent. En melkveehouder Maurice, binnenvaartschipper Floris en boswachter Tim vertellen hoe zij door de droogte zijn geraakt.",
  "guid": "https://nos.nl/l/2256743",
  "isoDate": "2018-10-28T08:54:22.000Z",
  "itunes": {},
  "category": "Binnenlands"
};

describe('hooks', function() {
  before(function() {
    fs.readFile('feed.json', content => {
      controlfeed = JSON.parse(content);
    });

    fs.readFile('feed_with_changes.json', content => {
      changedfeed = JSON.parse(content);
    });
  });
});

describe('Helpers', function() {
  describe('String Methods', function() {
    it('Should capitalize', function() {
      let input = "lorem ipsum";
      let expected = "Lorem Ipsum";
      let actual = server.capitalize.call(input);
      assert.deepStrictEqual(actual, expected);
    });

    it('Should strip cats', function() {
      let input = "NOS.nl buitenlands nieuws";
      let expected = "Buitenlands";
      let actual = server.catStrip.call(input);
      assert.deepStrictEqual(actual, expected);
    });
  });

  describe('Auxiliary Methods', function() {
    it('Should generate status text', function() {
      let expected = "[Binnenlands] De kop «Nu merken we pas écht hoe gortdroog de zomer was» is zojuist gewijzigd naar «Deze zomer was verdomd droog lmao» https://nos.nl/l/2256743";
      let actual = server.makeStatusText(changeditem, controlitem);
      assert.deepStrictEqual(actual, expected);
    });
  });
});

