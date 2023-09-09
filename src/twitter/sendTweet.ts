import { Clog, LOGLEVEL } from '@fdebijl/clog';
import { Collection } from 'mongodb';
import { SendTweetV2Params } from 'twitter-api-v2';

import { Article, SeenArticle } from '../types';
import { shimStatus } from '../util/shimStatus';
import { insertSeenArticle } from '../db/insertSeenArticle';
import { addTweetToArticle } from '../db/addTweetToArticle';
import { twitterClient } from './initializeTwit';

const clog = new Clog();

export async function sendTweet(collection: Collection<SeenArticle>, payload: Partial<SendTweetV2Params>, article: Article, seenArticle?: SeenArticle): Promise<void> {
  try {
    const tweetResult = await twitterClient.v2.tweet(payload);
    const shimmedTweetResult = shimStatus(tweetResult);

    clog.log(`Sent out a tweet: ${payload.text}`, LOGLEVEL.DEBUG);

    if (seenArticle) {
      addTweetToArticle(collection, shimmedTweetResult, article);
    } else {
      const newlySeenArticle: SeenArticle = {
        org: article.org,
        articleId: article.articleID,
        tweets: [{
          status: shimmedTweetResult.data,
          newTitle: article.titles[article.titles.length - 1],
          oldTitle: article.titles[article.titles.length - 2]
        }]
      };

      await insertSeenArticle(collection, newlySeenArticle);
      clog.log(`Inserted new 'seen' article into database (${article.org}:${article.articleID})`, LOGLEVEL.DEBUG);
    }
  } catch (error) {
    clog.log('Error while sending tweet', LOGLEVEL.ERROR);
    clog.log(error, LOGLEVEL.ERROR);
  }
}
