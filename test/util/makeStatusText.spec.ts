import assert from 'assert';

import { exampleArticle } from '../_fixtures/examples';
import { makeStatusText } from '../../src/util/makeStatusText';

describe('makeStatusText', () => {
  it('Should generate status text', async () => {
    const expected = 'De kop «Tekort aan zorgpersoneel? \'Dan denk ik: eigen schuld, dikke bult\'» is na één dag gewijzigd naar «Tekort aan zorgpersoneel: maar die grijze golf zagen we toch al lang aankomen?» https://nos.nl/l/2277647';
    const actual = await makeStatusText(exampleArticle);
    assert.deepStrictEqual(actual, expected);
  });
});
