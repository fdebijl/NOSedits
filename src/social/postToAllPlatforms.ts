import { mastodon } from 'masto';
import { Collection } from 'mongodb';
import { Clog, LOGLEVEL } from '@fdebijl/clog';
import { SendTweetV2Params } from 'twitter-api-v2';
import { AppBskyFeedPost, RichText } from '@atproto/api'

import { CONFIG } from '../config';
import { Article, SeenArticle } from '../types';
import { articleHasErrors, doublePostGuard } from '../util';
import { getSeenArticle, insertSeenArticle } from '../db';

import { sendToot } from './sendToot';
import { sendTweet } from './sendTweet';
import { agent, sendSkeet } from './sendSkeet';

const clog = new Clog();

export const postToAllPlatforms = async (article: Article, collection: Collection<SeenArticle>, text: string): Promise<void> => {
  const articleErrors = articleHasErrors(article);

  if (articleErrors) {
    return;
  }

  let seenArticle = await getSeenArticle(collection, article);
  if (!seenArticle) {
    seenArticle = {
      org: article.org,
      articleId: article.articleID,
      tweets: [],
      toots: [],
      skeets: []
    };

    await insertSeenArticle(collection, seenArticle);
    clog.log(`Inserted new 'seen' article into database (${article.org}:${article.articleID})`, LOGLEVEL.DEBUG);
  }

  if (CONFIG.USE_TWITTER) {
    try {
      const twitterParams: SendTweetV2Params = { text };

      if (seenArticle.tweets.length > 0) {
        clog.log(`Found previous tweet(s) for ${article.org}:${article.articleID}`, LOGLEVEL.DEBUG);
        twitterParams.reply = {
          in_reply_to_tweet_id: seenArticle.tweets[seenArticle.tweets.length - 1].status.id_str
        }
      } else {
        clog.log(`Did not find previous tweet(s) for ${article.org}:${article.articleID}`, LOGLEVEL.DEBUG);
      }

      await doublePostGuard(collection, article, 'twitter');
      await sendTweet(collection, twitterParams, article, seenArticle || undefined);
    } catch (error) {
      clog.log('Error while sending tweet:', LOGLEVEL.ERROR);
      clog.log(error, LOGLEVEL.ERROR);
    }
  }

  if (CONFIG.USE_MASTODON) {
    try {
      const mastodonParams: mastodon.rest.v1.CreateStatusParams = {
        status: text,
        visibility: 'public',
        inReplyToId: seenArticle.toots.length > 0 ? seenArticle.toots[seenArticle.toots.length - 1].status.id : undefined
      };

      if (seenArticle.toots.length > 0) {
        clog.log(`Found previous toot(s) for ${article.org}:${article.articleID}`, LOGLEVEL.DEBUG);
      } else {
        clog.log(`Did not find previous toot(s) for ${article.org}:${article.articleID}`, LOGLEVEL.DEBUG);
      }

      await doublePostGuard(collection, article, 'mastodon');
      await sendToot(collection, mastodonParams, article, seenArticle || undefined);
    } catch (error) {
      clog.log('Error while sending toot:', LOGLEVEL.ERROR);
      clog.log(error, LOGLEVEL.ERROR);
    }
  }

  if (CONFIG.USE_BLUESKY) {
    try {
      const rt = new RichText({ text });
      await rt.detectFacets(agent);
      const skeetParams: Omit<AppBskyFeedPost.Record, 'createdAt'> = {
        text: rt.text,
        facets: rt.facets
      };

      if (seenArticle.skeets.length > 0) {
        clog.log(`Found previous skeet(s) for ${article.org}:${article.articleID}`, LOGLEVEL.DEBUG);
        skeetParams.reply = {
          root: {
            uri: seenArticle.skeets[0].status.uri,
            cid: seenArticle.skeets[0].status.cid
          },
          parent: {
            uri: seenArticle.skeets[seenArticle.skeets.length - 1].status.uri,
            cid: seenArticle.skeets[seenArticle.skeets.length - 1].status.cid
          }
        }
      } else {
        clog.log(`Did not find previous skeet(s) for ${article.org}:${article.articleID}`, LOGLEVEL.DEBUG);
      }

      await doublePostGuard(collection, article, 'bluesky');
      await sendSkeet(collection, skeetParams, article, seenArticle || undefined);
    } catch (error) {
      clog.log('Error while sending skeet:', LOGLEVEL.ERROR);
      clog.log(error, LOGLEVEL.ERROR);
    }
  }
}
