import isEmptyArray from '../../utils/isEmptyArray';

describe('isEmptyArray', () => {
  it('should return true when value is an empty array', () => {
    expect(isEmptyArray([])).toBeTruthy();
  });

  it('should return false when value is not an empty array', () => {
    expect(isEmptyArray(null)).toBeFalsy();
    expect(isEmptyArray(undefined)).toBeFalsy();
    expect(isEmptyArray(-1)).toBeFalsy();
    expect(isEmptyArray(0)).toBeFalsy();
    expect(isEmptyArray(1)).toBeFalsy();
    expect(isEmptyArray('')).toBeFalsy();
    expect(isEmptyArray(() => null)).toBeFalsy();
    expect(isEmptyArray({ foo: 'bar' })).toBeFalsy();
    expect(isEmptyArray({})).toBeFalsy();
    expect(isEmptyArray(['foo', 'bar'])).toBeFalsy();
  });
});
