import assert from 'assert';

import { getDifferenceBetweenTimestamps } from '../../../../dist/util/time/getDifferenceBetweenTimestamps';

describe('getDifferenceBetweenTimestamps', () => {
  it('Should generate difference in Dutch', async () => {
    const oldTimestamp = 1582156204013; // February 19th 2020, 11:30:16 pm
    const newTimestamp = 1582189809547; // February 20th 2020, 9:10:09 am

    const expected = 'na 9 uur ';
    const actual = await getDifferenceBetweenTimestamps(oldTimestamp, newTimestamp);
    assert.deepStrictEqual(actual, expected);
  });
});
