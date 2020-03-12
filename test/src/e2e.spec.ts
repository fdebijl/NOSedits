import assert from 'assert';

// import { mocktwit } from './shared/mocktwit';
// import { exampleArticle } from './shared/examples';

// import { makeStatusText } from '../../dist/util/makeStatusText';

it('Should pass', async () => {
  assert.ok('Passed');
});

// describe('Main methods', function() {
//   it('Should deny double calls', async function() {
//     const first = await server.notifyTitleChanged(exampleArticle, mocktwit);

//     const second = server.notifyTitleChanged(exampleArticle, mocktwit).catch((error) => {
//       assert.deepStrictEqual(error, server.errors.ALREADY_TWEETED);
//       mocktwit.reset();
//     });
//   });

//   it('Should send out a tweet', async function() {
//     server.notifyTitleChanged(exampleArticle2, mocktwit).then((statustext) => {
//       const expected = "nothing";
//       const actual = mocktwit.lastRequest.params.status;
//       assert.deepStrictEqual(actual, expected);
//     }).catch((error) => {
//       assert.fail();
//     })
//   });

//   it('Should reject calls with less than two titles', async function() {
//     const invalidArticle = exampleArticle;
//     invalidArticle.titles = invalidArticle.titles.slice(0, 1);

//     server.notifyTitleChanged(invalidArticle).catch((error) => {
//       assert.deepStrictEqual(error, server.errors.NOT_ENOUGH_TITLES);
//     });
//   });

//   it('Should reject unchanged titles', function() {
//     server.notifyTitleChanged(sameTitlesArticle).catch((error) => {
//       assert.deepStrictEqual(error, server.errors.NO_DIFFERENCE);
//     });
//   });
// })

