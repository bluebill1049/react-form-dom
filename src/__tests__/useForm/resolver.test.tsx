import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { useForm } from '../../useForm';
import noop from '../../utils/noop';
import sleep from '../../utils/sleep';

describe('resolver', () => {
  it('should update context within the resolver', async () => {
    type FormValues = {
      test: string;
    };

    const App = () => {
      const [test, setTest] = React.useState('');
      const [data, setData] = React.useState({});
      const { handleSubmit } = useForm<FormValues>({
        resolver: (_, context) => {
          return {
            errors: {},
            values: context as FormValues,
          };
        },
        context: {
          test,
        },
      });

      return (
        <>
          <input
            value={test}
            onChange={(e) => {
              setTest(e.target.value);
            }}
          />
          <button onClick={handleSubmit((data) => setData(data))}>Test</button>
          <p>{JSON.stringify(data)}</p>
        </>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });
    fireEvent.click(screen.getByRole('button'));

    expect(
      await screen.findByText('{"test":"test"}', undefined, { timeout: 3000 }),
    ).toBeVisible();
  });

  it('should support resolver schema switching', async () => {
    type FormValues = {
      test: string;
    };

    const fakeResolver = (schema: boolean) => async () => {
      return schema
        ? {
            values: { test: 'ok' },
            errors: {},
          }
        : {
            values: {},
            errors: {
              test: {
                type: 'test',
                value: { message: 'wrong', type: 'test' },
              },
            },
          };
    };

    type AppProps = {
      fakeResolver: typeof fakeResolver;
    };

    const App = ({ fakeResolver }: AppProps) => {
      const [schema, setSchema] = React.useState(false);
      const [submit, setSubmit] = React.useState(false);
      const {
        register,
        handleSubmit,
        formState: { errors },
      } = useForm<FormValues>({
        resolver: fakeResolver(schema),
      });

      return (
        <form
          onSubmit={handleSubmit(() => {
            setSubmit(true);
          })}
        >
          <input {...register('test')} />
          {errors.test && <p>Error</p>}
          {submit && <p>Submitted</p>}
          <button onClick={() => setSchema(!schema)}>Toggle</button>
          <button>Submit</button>
        </form>
      );
    };

    render(<App fakeResolver={fakeResolver} />);

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Error')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Toggle' }));

    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    expect(await screen.findByText('Submitted')).toBeVisible();
  });

  it('should be called with the shouldUseNativeValidation option to true', async () => {
    const test = jest.fn();
    const resolver = (a: any, b: any, c: any) => {
      test(a, b, c);
      return {
        errors: {},
        values: {},
      };
    };

    type AppProps = {
      resolver: typeof resolver;
    };

    const App = ({ resolver }: AppProps) => {
      const { register, handleSubmit } = useForm({
        resolver: async (data, context, options) =>
          resolver(data, context, options),
        shouldUseNativeValidation: true,
      });

      return (
        <form onSubmit={handleSubmit(noop)}>
          <input {...register('test')} />
          <button>Submit</button>
        </form>
      );
    };

    render(<App resolver={resolver} />);

    fireEvent.click(screen.getByRole('button'));

    expect(test.mock.calls[0][2]).toEqual(
      expect.objectContaining({ shouldUseNativeValidation: true }),
    );
  });

  it('should avoid the problem of race condition', async () => {
    jest.useFakeTimers();

    const test = jest.fn();
    let errorsObject = {};

    const resolver = async (a: any, b: any, c: any) => {
      test(a, b, c);

      if (a.test !== 'OK') {
        await sleep(100);
        return {
          errors: {
            test: {
              type: 'test',
              value: { message: 'wrong', type: 'test' },
            },
          },
          values: {},
        };
      }

      return {
        errors: {},
        values: { test: a.test },
      };
    };

    const App = () => {
      const {
        register,
        formState: { errors },
      } = useForm({
        resolver,
        mode: 'onChange',
      });
      errorsObject = errors;

      return (
        <form>
          <input type="text" {...register('test')} />
        </form>
      );
    };

    render(<App />);

    const inputElm = screen.getByRole('textbox');

    fireEvent.change(inputElm, {
      target: {
        value: 'O',
      },
    });

    fireEvent.change(inputElm, {
      target: {
        value: 'OK',
      },
    });

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(errorsObject).toEqual({});
  });
});
