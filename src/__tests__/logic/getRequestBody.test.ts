import getRequestBody from '../../logic/getRequestBody';

const data = {
  a: 'foo',
  b: ' ',
};

describe('getRequestBody', () => {
  it('should return correct value when content type is application/x-www-form-urlencoded', () => {
    expect(getRequestBody('application/x-www-form-urlencoded', data)).toBe(
      'a=foo&b=+',
    );
  });

  it('should return correct value when content type is application/json', () => {
    expect(getRequestBody('application/json', data)).toBe(
      '{"a":"foo","b":" "}',
    );
  });

  it('should return correct value when content type is text/plain', () => {
    expect(getRequestBody('text/plain', data)).toBe('a:foo\nb: ');
  });

  it('should return correct value when content type is multipart/form-data', () => {
    const formData = getRequestBody('multipart/form-data', data);
    expect(formData.get('a')).toBe('foo');
    expect(formData.get('b')).toBe(' ');
  });
});
