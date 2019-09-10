import isSameError from './isSameError';
import { Error } from '../types';

describe('isSameError', () => {
  it('should detect if it contain the same error', () => {
    expect(
      isSameError(
        {
          type: 'test',
          message: 'what',
        } as Error,
        'test',
        'what',
      ),
    ).toBeTruthy();

    expect(
      isSameError(
        {
          type: '',
          message: '',
        } as Error,
        '',
        '',
      ),
    ).toBeTruthy();
  });

  it('should return false when error is not even defined', () => {
    expect(isSameError(undefined, '', '')).toBeFalsy();
    expect(isSameError('test' as any, '', '')).toBeFalsy();
    expect(isSameError(5 as any, '', '')).toBeFalsy();
  });
});
