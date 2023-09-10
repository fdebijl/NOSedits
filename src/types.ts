import { TweetV2PostTweetResult } from 'twitter-api-v2';
import { AppBskyFeedPost } from '@atproto/api';
import { mastodon } from 'masto';

export class PostError {
  static readonly ALREADY_POSTED = {
    code: 'ERR_ALREADY_POSTED',
    message: 'Already posted this combination of titles'
  };

  static readonly NOT_ENOUGH_TITLES = {
    code: 'ERR_NOT_ENOUGH_TITLES',
    message: 'The article only contained one title, atleast two are needed to formulate a post'
  };

  static readonly NO_DIFFERENCE = {
    code: 'ERR_NO_DIFFERENCE_BETWEEN_TITLES',
    message: 'The last two titles in the article are the same, ignoring hook'
  };

  static readonly POST_NOT_SENT = {
    code: 'ERR_COULD_NOT_SEND_POST',
    message: 'An unknown error occured while sending the post for this article'
  };

  static readonly NOT_CHRONOLOGICAL = {
    code: 'ERR_TITLES_NOT_CHRONOLOGICAL',
    message: 'The titles in this article are not ordered chronologically: one or more titles had a timestamp that is earlier than the one before it'
  }
}

export interface Title {
  /** Text of the title */
  title: string;
  /** Human readable date and time for when the scraper saw this title */
  datetime: string;
  /** Unix epoch in milliseconds when this title was scraped */
  timestamp: number;
}

/**
 * A single news article with at least one title
 * 'org' refers to the publishing organization, in this case the NOS
 */
export interface Article {
  /** Name of the publishing organization */
  org: string;
  /** ID for this article as defined by the org */
  articleID: string;
  /** Human readable name of the RSS feed the article was scraped from */
  feedtitle: string;
  /** Machine readable name of the RSS feed the article was scraped from */
  sourcefeed: string;
  /** Language that the medium is classified as - not guaranteed to be the language of the article */
  lang: string;
  /** Link for this article as defined by the org */
  link: string;
  /** GUID for this article as defined by the org */
  guid: string;
  /** Chronologically sorted (old to new) array of titles for this article */
  titles: Title[];
  /** Human readable date and time for when the scraper first picked up this article */
  first_seen: string;
  /** Human readable date and time for when the article was published as defined by the org */
  pub_date: string;
}

export interface Post {
  newTitle: Title;
  oldTitle: Title;
}

export interface Tweet extends Post {
  status: ShimmedTweetV2PostTweetResultData;
}

export interface Toot extends Post {
  status: mastodon.v1.Status;
}

export interface Skeet extends Post {
  status: PersistedBlueSkyRecord;
}

export interface SeenArticle {
  org: string;
  articleId: string;
  tweets: Tweet[];
  toots: Toot[];
  skeets: Skeet[];
}

export interface ShimmedTweetV2PostTweetResult extends TweetV2PostTweetResult {
  data: ShimmedTweetV2PostTweetResultData;
}

export interface ShimmedTweetV2PostTweetResultData {
  id: string;
  text: string;
  id_str: string;
}

export interface PersistedBlueSkyRecord extends AppBskyFeedPost.Record {
  uri: string;
  cid: string;
}
