import { Clog, LOGLEVEL } from '@fdebijl/clog';
import { Collection } from 'mongodb';
import { TwitterApi, TwitterApiReadWrite, SendTweetV2Params } from 'twitter-api-v2';

import { Article, SeenArticle } from '../types';
import { shimStatus } from '../util';
import { addTweetToArticle } from '../db';
import { CONFIG } from '../config';

const clog = new Clog();

let twitterClient: TwitterApiReadWrite;

(async () => {
  if (!CONFIG.USE_TWITTER) {
    return clog.log('Twitter is disabled, not initializing Twitter client', LOGLEVEL.DEBUG);
  }

  twitterClient = new TwitterApi({
    appKey: CONFIG.TWITTER.APP_KEY,
    appSecret: CONFIG.TWITTER.APP_SECRET,
    accessToken: CONFIG.TWITTER.ACCESS_TOKEN,
    accessSecret: CONFIG.TWITTER.ACCESS_SECRET
  }).readWrite;

  clog.log('Logged in to Twitter', LOGLEVEL.DEBUG);
})();

export async function sendTweet(collection: Collection<SeenArticle>, payload: Partial<SendTweetV2Params>, article: Article, seenArticle?: SeenArticle): Promise<void> {
  const tweetResult = await twitterClient.v2.tweet(payload);
  const shimmedTweetResult = shimStatus(tweetResult);

  clog.log(`Sent out a tweet: ${payload.text}`, LOGLEVEL.DEBUG);

  if (seenArticle) {
    await addTweetToArticle(collection, shimmedTweetResult, article);
  }
}
