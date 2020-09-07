import { Clog, LOGLEVEL } from '@fdebijl/clog';
import Twit from 'twit';
import { Collection } from 'mongodb';

import { CONFIG } from '../config';
import { MockTwit, Article, SeenArticle } from '../types';
import { insertSeenArticle } from '../db/insertSeenArticle';
import { addTweetToArticle } from '../db/addTweetToArticle';

const clog = new Clog();

export async function sendTweet(collection: Collection, params: Twit.Params, twitterClient: Twit | MockTwit, article: Article, seenArticle?: SeenArticle): Promise<void> {
  return new Promise((resolve, reject) => {
    (twitterClient as Twit).post('statuses/update', params, async (err, result) => {
      if (err) {
        clog.log(err.message, LOGLEVEL.ERROR);
        reject(err);
        return;
      }

      clog.log(`Sent out a tweet: ${params.status}`, LOGLEVEL.DEBUG);

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