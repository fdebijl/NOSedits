import Twit from 'twit';

export const initializeTwit = async (): Promise<Twit> => {
  const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY as string,
    consumer_secret: process.env.CONSUMER_SECRET as string,
    access_token: process.env.ACCESS_TOKEN as string,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET as string
  });

  return T;
};