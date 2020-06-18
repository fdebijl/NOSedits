import { Clog, LOGLEVEL } from '@fdebijl/clog';
import Twit from 'twit';
import { Collection } from 'mongodb';
import * as Sentry from '@sentry/node';

import { CONFIG } from '../config';
import { MockTwit, Article, SeenArticle } from '../types';
import { insertSeenArticle } from '../db/insertSeenArticle';
import { addTweetToArticle } from '../db/addTweetToArticle';

export async function sendTweet(collection: Collection, params: Twit.Params, twitterClient: Twit | MockTwit, article: Article, seenArticle?: SeenArticle): Promise<void> {
  return new Promise((resolve, reject) => {
    const clog = new Clog(CONFIG.MIN_LOGLEVEL);

    (twitterClient as Twit).post('statuses/update', params, async (err, result) => {
      if (err) {
        clog.log(err.message, LOGLEVEL.ERROR);
        reject(err);
        return;
      }

      clog.log(`Sent out a tweet: ${params.status}`, LOGLEVEL.DEBUG);
      Sentry.captureMessage(`Sent out a tweet: ${params.status}`);

      if (seenArticle) {
        addTweetToArticle(collection, result as Twit.Twitter.Status, article);
      } else {
        const newlySeenArticle: SeenArticle = {
          org: article.org,
          articleId: article.articleID,
          tweets: [{
            status: result as Twit.Twitter.Status,
            newTitle: article.titles[article.titles.length - 1],
            oldTitle: article.titles[article.titles.length - 2]
          }]
        };

        await insertSeenArticle(collection, newlySeenArticle);
        clog.log(`Inserted new 'seen' article into database (${article.org}:${article.articleID})`, LOGLEVEL.DEBUG);
      }

      resolve();
    })
  });
}