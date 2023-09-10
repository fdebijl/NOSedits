import { Clog, LOGLEVEL} from '@fdebijl/clog';
import { Collection } from 'mongodb';

import { Article, SeenArticle, ShimmedTweetV2PostTweetResult } from '../types';
import { getSeenArticle } from './getSeenArticle';

const clog = new Clog();

export const addTweetToArticle = async (collection: Collection<SeenArticle>, status: ShimmedTweetV2PostTweetResult, article: Article): Promise<void> => {
  const seenArticle = await getSeenArticle(collection, article);

  if (seenArticle) {
    const tweets = seenArticle.tweets  || [];

    tweets.push({
      status: status.data,
      newTitle: article.titles[article.titles.length - 1],
      oldTitle: article.titles[article.titles.length - 2]
    });

    try {
      await collection.updateOne({ org: article.org, articleId: article.articleID }, {$set: {'tweets': tweets}});
      clog.log(`Added tweet to article ${article.org}:${article.articleID}, Tweet length should now be ${tweets.length}`, LOGLEVEL.DEBUG)
    } catch (error) {
      clog.log(error, LOGLEVEL.ERROR);
    }
  }
}
