import { Article } from '../types';
import { getSeenArticle } from './getSeenArticle';
import { Collection } from 'mongodb';
import { Twitter } from 'twit';
import { Clog, LOGLEVEL} from '@fdebijl/clog';

const clog = new Clog();

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



      collection.updateOne({ org: article.org, articleId: article.articleID }, {$set: {'tweets': tweets}}, (error, result) => {
        if (error) {
          clog.log(error, LOGLEVEL.ERROR);
        }

        if (result) {
          clog.log(`Added tweet to article ${article.org}:${article.articleID}, Tweet length should now be ${tweets.length}`, LOGLEVEL.DEBUG)
        }

        resolve();
      });
    } else {
      resolve();
      return;
    }
  });
}