const assert = require('assert');
const fs = require('fs');

const server = require('../server.js');
const mocktwit = require('./mocktwit.js');

describe('Helpers', function() {
  describe('Auxiliary Methods', function() {
    it('Should generate status text', function() {
      const expected = "De kop «Tekort aan zorgpersoneel? 'Dan denk ik: eigen schuld, dikke bult'» is na één dag gewijzigd naar «Tekort aan zorgpersoneel: maar die grijze golf zagen we toch al lang aankomen?» https://nos.nl/l/2277647";
      const actual = server.makeStatusTextFor(exampleArticle);
      assert.deepStrictEqual(actual, expected);
    });
  });
});

describe('Main methods', function() {
  it('Should deny double calls', async function() {
    const first = await server.notifyTitleChanged(exampleArticle, mocktwit);

    const second = server.notifyTitleChanged(exampleArticle, mocktwit).catch((error) => {
      assert.deepStrictEqual(error, server.errors.ALREADY_TWEETED);
      mocktwit.reset();
    });
  });

  it('Should send out a tweet', async function() {
    server.notifyTitleChanged(exampleArticle2, mocktwit).then((statustext) => {
      const expected = "nothing";
      const actual = mocktwit.lastRequest.params.status;
      assert.deepStrictEqual(actual, expected);
    }).catch((error) => {
      assert.fail();
    })
  });

  it('Should reject calls with less than two titles', async function() {
    const invalidArticle = exampleArticle;
    invalidArticle.titles = invalidArticle.titles.slice(0, 1);

    server.notifyTitleChanged(invalidArticle).catch((error) => {
      assert.deepStrictEqual(error, server.errors.NOT_ENOUGH_TITLES);
    });
  });

  it('Should reject unchanged titles', function() {
    server.notifyTitleChanged(sameTitlesArticle).catch((error) => {
      assert.deepStrictEqual(error, server.errors.NO_DIFFERENCE);
    });
  });
})

const exampleArticle = {
  "_id": "5c9a608e74cfe706a614f57d",
  "org": "NOS",
  "articleID": "2277647",
  "feedtitle": "NOS.nl binnenlands nieuws",
  "sourcefeed": "nosnieuwsbinnenland",
  "lang": "NL",
  "link": "http://feeds.nos.nl/~r/nosnieuwsbinnenland/~3/VjhPXN9DyLk/2277647",
  "guid": "https://nos.nl/l/2277647",
  "titles": [
    {
      "title": "Tekort aan zorgpersoneel? 'Dan denk ik: eigen schuld dikke bult'",
      "datetime": "March 26th 2019, 12:55:47 pm",
      "timestamp": 1553621134837
    },
    {
      "title": "Tekort aan zorgpersoneel? 'Dan denk ik: eigen schuld, dikke bult'",
      "datetime": "March 26th 2019, 6:50:29 pm",
      "timestamp": 1553622629779
    },
    {
      "title": "Tekort aan zorgpersoneel: maar die grijze golf zagen we toch al lang aankomen?",
      "datetime": "March 27th 2019, 4:27:00 pm",
      "timestamp": 1553700420089
    }
  ],
  "first_seen": "March 26th 2019, 6:25:34 pm",
  "pub_date": "March 26th 2019, 12:55:47 pm"
}

const exampleArticle2 = {
  "_id": "5cef1154335fbb1e4b0b328f",
  "org": "NOS",
  "articleID": "2286909",
  "feedtitle": "NOS Nieuws",
  "sourcefeed": "nosnieuwsalgemeen",
  "lang": "nl",
  "link": "https://nos.nl/l/2286909",
  "guid": "https://nos.nl/l/2286909",
  "titles": [
    {
      "title": "Rondvaartboot kapseist en zinkt in Boedapest, zeker zeven doden",
      "datetime": "May 30th 2019, 12:54:35 am",
      "timestamp": 1559171412152
    },
    {
      "title": "Rondvaartboot kapseist en zinkt in Boedapest: zeven doden, 21 vermist",
      "datetime": "May 30th 2019, 8:03:53 am",
      "timestamp": 1559196233695
    },
    {
      "title": "Vrees voor tientallen doden na kapseizen toeristenboot in Boedapest",
      "datetime": "May 30th 2019, 8:57:03 am",
      "timestamp": 1559199423691
    }
  ],
  "first_seen": "May 30th 2019, 1:10:12 am",
  "pub_date": "May 30th 2019, 12:54:35 am"
}

const sameTitlesArticle = {
  "_id": "5c9a608e74cfe706a614f57d",
  "org": "NOS",
  "articleID": "2277647",
  "feedtitle": "NOS.nl binnenlands nieuws",
  "sourcefeed": "nosnieuwsbinnenland",
  "lang": "NL",
  "link": "http://feeds.nos.nl/~r/nosnieuwsbinnenland/~3/VjhPXN9DyLk/2277647",
  "guid": "https://nos.nl/l/2277647",
  "titles": [
    {
      "title": "Tekort aan zorgpersoneel? 'Dan denk ik: eigen schuld dikke bult'",
      "datetime": "March 26th 2019, 12:55:47 pm",
      "timestamp": 1553621134837
    },
    {
      "title": "Tekort aan zorgpersoneel? 'Dan denk ik: eigen schuld dikke bult'",
      "datetime": "March 26th 2019, 6:50:29 pm",
      "timestamp": 1553622629779
    }
  ],
  "first_seen": "March 26th 2019, 6:25:34 pm",
  "pub_date": "March 26th 2019, 12:55:47 pm"
}