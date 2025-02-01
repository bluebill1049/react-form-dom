import isWatched from '../../logic/isWatched';

describe('isWatched', () => {
  it('should return watched fields', () => {
    expect(
      isWatched('', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(),
        focus: '',
        watchAll: true,
      }),
    ).toBeTruthy();

    expect(
      isWatched('test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeTruthy();
  });

  it('should return true when watched with parent node', () => {
    expect(
      isWatched('test.test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeTruthy();

    expect(
      isWatched('test.test.test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['test.test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeTruthy();

    expect(
      isWatched('test.test.test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['testFail.test', 'test.test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeTruthy();

    expect(
      isWatched('test.0', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeTruthy();

    expect(
      isWatched('test.0.test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['test.0']),
        focus: '',
        watchAll: false,
      }),
    ).toBeTruthy();
  });

  it("should return false when watched with parent node that doesn't match child name", () => {
    expect(
      isWatched('test.test.test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['tesk.test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeFalsy();

    expect(
      isWatched('test.test.test', {
        mount: new Set(),
        disabled: new Set(),
        unMount: new Set(),
        array: new Set(),
        watch: new Set(['testFail.test']),
        focus: '',
        watchAll: false,
      }),
    ).toBeFalsy();
  });

  it('should return falsy for blur event', () => {
    expect(
      isWatched(
        '',
        {
          mount: new Set(),
          disabled: new Set(),
          unMount: new Set(),
          array: new Set(),
          watch: new Set(),
          focus: '',
          watchAll: true,
        },
        true,
      ),
    ).toBeFalsy();
  });
});
