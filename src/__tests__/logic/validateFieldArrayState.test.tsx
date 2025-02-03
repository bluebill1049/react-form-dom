import validateField from '../../logic/validateField';
import * as isHTMLElement from '../../utils/isHTMLElement';

jest.mock('../../utils/isHTMLElement', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('validateField', () => {
  it('should not detect isEmpty when handling a custom built select', async () => {
    jest.spyOn(isHTMLElement, 'default').mockImplementation(() => {
      return true;
    });

    /**
     * With a custom built select component it can happen that the
     * referenced element does not have a value attribute.
     * But the state is correctly set at the moment of validation.
     */
    expect(
      await validateField(
        {
          _f: {
            mount: true,
            name: 'test',
            ref: { value: '', name: 'test' },
            required: true,
          },
        },
        {
          test: [
            { label: 'Blackberry', value: 'blackberry' },
            { label: 'Banana', value: 'banana' },
          ],
        },
        false,
      ),
    ).toEqual({});
  });
});
