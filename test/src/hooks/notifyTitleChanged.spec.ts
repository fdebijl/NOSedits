import assert from 'assert';
import { Collection } from 'mongodb';

import { exampleArticle, exampleArticle2, sameTitlesArticle } from '../examples';
import { MockTwit } from '../mocktwit';
import { CONFIG } from '../config';

import { TwitterError } from '../../../dist/types';
import { connect } from '../../../dist/db/connect';
import { notifyTitleChanged } from '../../../dist/hooks/notifyTitleChanged';

describe('notifyTitleChanged', () => {
  let mocktwit: MockTwit;
  let articleCollection: Collection;

  before(async () => {
    mocktwit = new MockTwit();
    const { db } = await connect(CONFIG.MONGO_URL);
    db.dropCollection('articles');
    articleCollection = db.collection('articles');
    return;
  });

  it('Should deny double calls', async () => {
    await notifyTitleChanged(exampleArticle, mocktwit, articleCollection);

    try {
      await notifyTitleChanged(exampleArticle, mocktwit, articleCollection);
      assert.fail('Accepted double call');
    } catch (error) {
      mocktwit.reset();
      assert.deepStrictEqual(error, TwitterError.ALREADY_TWEETED);
    } finally {
      return;
    }
  });

  it('Should send out a tweet for a proper article', async () => {
    await notifyTitleChanged(exampleArticle2, mocktwit, articleCollection);
    const expected = 'De kop «Rondvaartboot kapseist en zinkt in Boedapest: zeven doden, 21 vermist» is na één uur gewijzigd naar «Vrees voor tientallen doden na kapseizen toeristenboot in Boedapest» https://nos.nl/l/2286909';
    const actual = mocktwit.lastRequest?.params.status;
    return assert.deepStrictEqual(actual, expected);
  });

  it('Should reject calls with less than two titles', async () => {
    const invalidArticle = JSON.parse(JSON.stringify(exampleArticle));
    invalidArticle.titles = invalidArticle.titles.slice(0, 1);

    try {
      await notifyTitleChanged(invalidArticle, mocktwit, articleCollection);
      assert.fail('Accepted single-title call');
    } catch (error) {
      mocktwit.reset();
      assert.deepStrictEqual(error, TwitterError.NOT_ENOUGH_TITLES);
    } finally {
      return;
    }
  });

  it('Should reject unchanged titles', async () => {
    try {
      await notifyTitleChanged(sameTitlesArticle, mocktwit, articleCollection)
      assert.fail('Accepted unchanged title');
    } catch (error) {
      mocktwit.reset();
      assert.deepStrictEqual(error, TwitterError.NO_DIFFERENCE);
    } finally {
      return;
    }
  });
})