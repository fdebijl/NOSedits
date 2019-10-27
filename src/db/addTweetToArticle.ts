import { Article } from '../types';
import { getSeenArticle } from './getSeenArticle';
import { Collection } from 'mongodb';
import { Twitter } from 'twit';

export const addTweetToArticle = async (collection: Collection, status: Twitter.Status, article: Article): Promise<void> => {
  return new Promise(async resolve => {
    const seenArticle = await getSeenArticle(collection, article);

    if (seenArticle) {
      const tweets = seenArticle.tweets;

      tweets.push({
        status,
        newTitle: article.titles[article.titles.length - 1],
        oldTitle: article.titles[article.titles.length - 2]
      })

      collection.updateOne({ org: article.org, articleID: article.articleID }, {$set: {tweets}}, (error, result) => {
        if (error) {
          console.log(error);
        }
        resolve();
      });
    } else {
      resolve();
      return;
    }
  });
}