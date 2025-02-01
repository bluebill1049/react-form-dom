import get from '../../utils/get';

describe('get', () => {
  it('should get the right data', () => {
    const test = {
      bill: [1, 2, 3],
      luo: [1, 3, { betty: 'test' }],
      betty: { test: { test1: [{ test2: 'bill' }] } },
      'betty.test.test1[0].test1': 'test',
      'dotted.filled': 'content',
      'dotted.empty': '',
    };
    expect(get(test, 'bill')).toEqual([1, 2, 3]);
    expect(get(test, 'bill[0]')).toEqual(1);
    expect(get(test, 'luo[2].betty')).toEqual('test');
    expect(get(test, 'betty.test.test1[0].test2')).toEqual('bill');
    expect(get(test, 'betty.test.test1[0].test1')).toEqual('test');
    expect(get(test, 'betty.test.test1[0].test3')).toEqual(undefined);
    expect(get(test, 'dotted.filled')).toEqual(test['dotted.filled']);
    expect(get(test, 'dotted.empty')).toEqual(test['dotted.empty']);
    expect(get(test, 'dotted.nonexistent', 'default')).toEqual('default');
  });

  it('should get from the flat data', () => {
    const test = {
      bill: 'test',
    };
    expect(get(test, 'bill')).toEqual('test');
  });

  it('should return undefined when provided with empty path', () => {
    const test = {
      bill: 'test',
    };
    expect(get(test, '')).toEqual(undefined);
    expect(get(test, undefined)).toEqual(undefined);
    expect(get(test, null)).toEqual(undefined);
  });
});
