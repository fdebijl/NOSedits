import moment from 'moment';
import { CONFIG } from '../../config';

export const getDifferenceBetweenTimestamps = async (oldTimestamp: number, newTimestamp: number): Promise<string> => {
  moment.locale(CONFIG.MOMENT.LOCALE);

  const timeDiff = moment(oldTimestamp).from(newTimestamp, true);

  // Fall back to empty diff if the timestamps can't be parsed
  const delay = timeDiff === 'Invalid date' ? '' : `na ${timeDiff} `
  return delay;
}