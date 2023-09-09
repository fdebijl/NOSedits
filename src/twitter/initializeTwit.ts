import { TwitterApi, TwitterApiReadWrite } from 'twitter-api-v2';

import { CONFIG } from '../config';

export let twitterClient: TwitterApiReadWrite;

(async () => {
  twitterClient = new TwitterApi({
    appKey: CONFIG.TWITTER.APP_KEY,
    appSecret: CONFIG.TWITTER.APP_SECRET,
    accessToken: CONFIG.TWITTER.ACCESS_TOKEN,
    accessSecret: CONFIG.TWITTER.ACCESS_SECRET
  }).readWrite;
})();
