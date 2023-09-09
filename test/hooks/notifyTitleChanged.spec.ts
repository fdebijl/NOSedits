// import assert from 'assert';
// import { Collection } from 'mongodb';

// import { exampleArticle, exampleArticle2, sameTitlesArticle } from '../_fixtures/examples';
// import { MockTwit } from '../_fixtures/mocktwit';
// import { CONFIG } from '../config';

// import { SeenArticle, TwitterError } from '../../src/types';
// import { connect } from '../../src/db/connect';
// import { notifyTitleChanged } from '../../src/hooks/notifyTitleChanged';

// xdescribe('notifyTitleChanged', () => {
//   let mocktwit: MockTwit;
//   let articleCollection: Collection<SeenArticle>;

//   beforeEach(async () => {
//     const { db } = await connect(CONFIG.MONGO_URL);
//     const articleCollectionExists = await db.listCollections({ name: 'test-articles' }).hasNext();
//     if (articleCollectionExists) {
//       db.dropCollection('test-articles');
//     }
//     articleCollection = db.collection<SeenArticle>('test-articles');
//   });

//   it('Should deny double calls', async () => {
//     await notifyTitleChanged(exampleArticle, articleCollection);

//     try {
//       await notifyTitleChanged(exampleArticle, articleCollection);
//       assert.fail('Accepted double call');
//     } catch (error) {
//       assert.deepStrictEqual(error, TwitterError.ALREADY_TWEETED);
//     }

//     return;
//   });

//   it('Should send out a tweet for a proper article', async () => {
//     await notifyTitleChanged(exampleArticle2, articleCollection);
//     const expected = 'De kop «Rondvaartboot kapseist en zinkt in Boedapest: zeven doden, 21 vermist» is na één uur gewijzigd naar «Vrees voor tientallen doden na kapseizen toeristenboot in Boedapest» https://nos.nl/l/2286909';
//     const actual = mocktwit.lastRequest?.params.status;
//     return assert.deepStrictEqual(actual, expected);
//   });

//   it('Should reject calls with less than two titles', async () => {
//     const invalidArticle = JSON.parse(JSON.stringify(exampleArticle));
//     invalidArticle.titles = invalidArticle.titles.slice(0, 1);

//     try {
//       await notifyTitleChanged(invalidArticle, articleCollection);
//       assert.fail('Accepted single-title call');
//     } catch (error) {
//       assert.deepStrictEqual(error, TwitterError.NOT_ENOUGH_TITLES);
//     }
//   });

//   it('Should reject unchanged titles', async () => {
//     try {
//       await notifyTitleChanged(sameTitlesArticle, articleCollection)
//       assert.fail('Accepted unchanged title');
//     } catch (error) {
//       assert.deepStrictEqual(error, TwitterError.NO_DIFFERENCE);
//     }
//   });
// })
