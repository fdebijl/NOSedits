import { TweetV2PostTweetResult } from 'twitter-api-v2';
import { ShimmedTweetV2PostTweetResult } from '../types';

export const shimStatus = (status: TweetV2PostTweetResult) => {
  const shimmedStatus: ShimmedTweetV2PostTweetResult = status as ShimmedTweetV2PostTweetResult;
  shimmedStatus.data.id_str = `${status.data.id}`;
  return shimmedStatus;
}
