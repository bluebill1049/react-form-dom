import React, { useEffect } from 'react';
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';

import { Controller } from '../../controller';
import { Control, FieldValues } from '../../types';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';
import { useWatch } from '../../useWatch';
import isFunction from '../../utils/isFunction';
import noop from '../../utils/noop';

describe('watch', () => {
  it('should return undefined when input gets unregister', async () => {
    const Component = () => {
      const { register, watch, unregister } = useForm<{ test: string }>();
      const data = watch('test');

      return (
        <>
          <input {...register('test')} />
          <span>{data}</span>
          <button type="button" onClick={() => unregister('test')}>
            hide
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.input(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    expect(screen.getByText('test')).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });

  it('should watch individual input', async () => {
    const { result } = renderHook(() => {
      return useForm<{ test: string }>({
        defaultValues: {
          test: 'data',
        },
      });
    });

    expect(result.current.watch('test')).toBe('data');

    result.current.register('test');

    await act(async () => {
      result.current.setValue('test', 'data1');
    });

    act(() => {
      expect(result.current.watch('test')).toBe('data1');
    });
  });

  it('should watch input when mode is under onChange', async () => {
    const { result } = renderHook(() => {
      return useForm<{ test: string }>({
        defaultValues: {
          test: 'data',
        },
        mode: 'onChange',
      });
    });

    expect(result.current.watch('test')).toBe('data');

    result.current.register('test');

    await act(async () => {
      result.current.setValue('test', 'data1');
    });

    act(() => {
      expect(result.current.watch('test')).toBe('data1');
    });
  });

  it('should watch input when mode is under all', async () => {
    const { result } = renderHook(() => {
      return useForm<{ test: string }>({
        defaultValues: {
          test: 'data',
        },
        mode: 'all',
      });
    });

    expect(result.current.watch('test')).toBe('data');

    result.current.register('test');

    await act(async () => {
      result.current.setValue('test', 'data1');
    });

    act(() => {
      expect(result.current.watch('test')).toBe('data1');
    });
  });

  it('should return default value if field is undefined', () => {
    renderHook(() => {
      const { watch } = useForm<{ test: string }>({
        defaultValues: { test: 'test' },
      });

      expect(watch()).toEqual({ test: 'test' });
    });
  });

  it('should return default value for single input', () => {
    const results: unknown[] = [];
    const App = () => {
      const { watch } = useForm<{ test: string }>();

      results.push(watch('test', 'default'));

      return null;
    };

    render(<App />);

    expect(results).toEqual(['default']);
  });

  it('should return array of default value for array of inputs', () => {
    const results: unknown[] = [];
    const App = () => {
      const { watch } = useForm<{ test: string; test1: string }>();

      results.push(
        watch(['test', 'test1'], {
          test: 'default',
          test1: 'test',
        }),
      );

      return null;
    };

    render(<App />);

    expect(results).toEqual([['default', 'test']]);
  });

  it('should watch array of inputs', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string }>(),
    );

    expect(result.current.watch(['test', 'test1'])).toEqual([
      undefined,
      undefined,
    ]);

    const { ref } = result.current.register('test');
    isFunction(ref) &&
      ref({
        name: 'test',
        value: 'data1',
      });

    const { ref: ref1 } = result.current.register('test1');
    isFunction(ref1) &&
      ref1({
        name: 'test1',
        value: 'data2',
      });

    expect(result.current.watch(['test', 'test1'])).toEqual(['data1', 'data2']);
  });

  it('should watch every fields', () => {
    const { result } = renderHook(() =>
      useForm<{ test: string; test1: string }>(),
    );

    const { ref } = result.current.register('test');
    isFunction(ref) &&
      ref({
        name: 'test',
        value: 'data1',
      });

    const { ref: ref1 } = result.current.register('test1');
    isFunction(ref1) &&
      ref1({
        name: 'test1',
        value: 'data2',
      });

    expect(result.current.watch()).toEqual({ test: 'data1', test1: 'data2' });
  });

  it('should watch the entire field array with callback', () => {
    const output: any[] = [];

    const Component = () => {
      const { watch, register } = useForm<{
        test: string;
        test1: string;
      }>();

      React.useEffect(() => {
        const subscription = watch((data) => {
          data.test;
          data.test1;
          output.push(data);
        });

        return () => {
          subscription.unsubscribe();
        };
      }, [watch]);

      return <input {...register('test')} />;
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test1',
      },
    });

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test2',
      },
    });

    expect(output).toEqual([
      {
        test: 'test',
      },
      {
        test: 'test1',
      },
      {
        test: 'test2',
      },
    ]);
  });

  it('should watch correctly with useFieldArray with action and then fallback to onChange', () => {
    type FormValues = {
      names: {
        name: string;
      }[];
    };

    const output: object[] = [];

    const Component = () => {
      const { control, handleSubmit, watch } = useForm<FormValues>({
        defaultValues: {
          names: [],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'names',
      });

      const handleAddElement = () => {
        append({ name: 'test' });
      };

      output.push(watch());

      return (
        <form onSubmit={handleSubmit(noop)}>
          {fields.map((item, index) => {
            return (
              <div key={item.id}>
                <Controller
                  control={control}
                  name={`names.${index}.name` as const}
                  render={({ field }) => <input {...field} />}
                />
              </div>
            );
          })}
          <button type="button" onClick={handleAddElement}>
            Append
          </button>
        </form>
      );
    };

    render(<Component />);

    expect(output.at(-1)).toEqual({
      names: [],
    });

    const appendButton = screen.getByRole('button');

    fireEvent.click(appendButton);

    fireEvent.click(appendButton);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '123' },
    });

    expect(output.at(-1)).toEqual({
      names: [
        {
          name: '123',
        },
        {
          name: 'test',
        },
      ],
    });

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: '456' },
    });

    // Let's check all values of renders with implicitly the number of render (for each value)
    expect(output).toMatchSnapshot();
  });

  it('should have dirty marked when watch is enabled', async () => {
    function Component() {
      const {
        register,
        formState: { isDirty },
        watch,
      } = useForm<{
        lastName: string;
      }>({
        defaultValues: { lastName: '' },
      });
      watch('lastName');

      return (
        <form>
          <input {...register('lastName')} />
          <p>{isDirty ? 'True' : 'False'}</p>
        </form>
      );
    }

    render(<Component />);

    expect(screen.getByText('False')).toBeVisible();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'test' },
    });

    expect(screen.getByText('True')).toBeVisible();

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: '' },
    });

    expect(await screen.findByText('False')).toBeVisible();
  });

  it('should return deeply nested field values with defaultValues', async () => {
    let data;

    function App() {
      const { register, watch } = useForm<{
        test: {
          firstName: string;
          lastName: string;
        };
      }>({
        defaultValues: {
          test: { lastName: '', firstName: '' },
        },
      });
      data = watch();

      return (
        <form>
          <input {...register('test.lastName')} />
        </form>
      );
    }

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1234',
      },
    });

    expect(data).toEqual({
      test: {
        firstName: '',
        lastName: '1234',
      },
    });
  });

  it('should remove input value after input is unmounted with shouldUnregister: true', () => {
    const watched: unknown[] = [];
    const App = () => {
      const [show, setShow] = React.useState(true);
      const { watch, register } = useForm({
        shouldUnregister: true,
      });

      watched.push(watch());

      return (
        <div>
          {show && <input {...register('test')} />}
          <button
            onClick={() => {
              setShow(false);
            }}
          >
            toggle
          </button>
        </div>
      );
    };

    render(<App />);

    expect(watched).toEqual([{}]);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: '1',
      },
    });

    expect(watched).toEqual([
      {},
      {
        test: '1',
      },
    ]);

    fireEvent.click(screen.getByRole('button'));

    expect(watched).toEqual([
      {},
      {
        test: '1',
      },
      {
        test: '1',
      },
      {},
    ]);
  });

  it('should flush additional render for shouldUnregister: true', async () => {
    const watchedData: unknown[] = [];

    const App = () => {
      const { watch, reset, register } = useForm({
        shouldUnregister: true,
      });

      React.useEffect(() => {
        reset({
          test: '1234',
          data: '1234',
        });
      }, [reset]);

      const result = watch();

      watchedData.push(result);

      return (
        <div>
          <input {...register('test')} />
          {result.test && <p>{result.test}</p>}
        </div>
      );
    };

    render(<App />);

    expect(await screen.findByText('1234')).toBeVisible();

    expect(watchedData).toEqual([{}, {}, { test: '1234' }]);
  });

  it('should not be able to overwrite global watch state', () => {
    function Watcher<T extends FieldValues>({
      control,
    }: {
      control: Control<T>;
    }) {
      useWatch({
        control,
      });
      return null;
    }

    function App() {
      const { register, watch, control } = useForm({
        defaultValues: {
          firstName: '',
        },
      });
      const { firstName } = watch();

      return (
        <form>
          <p>{firstName}</p>
          <Watcher control={control} />
          <input {...register('firstName')} />
        </form>
      );
    }

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'bill',
      },
    });

    screen.getByText('bill');
  });

  it('should call the callback on every append', () => {
    interface FormValues {
      names: {
        firstName: string;
      }[];
    }
    const mockedFn = jest.fn();

    function App() {
      const { watch, control } = useForm<FormValues>({
        defaultValues: { names: [] },
      });

      const { fields, append } = useFieldArray({
        control,
        name: 'names',
      });

      useEffect(() => {
        const subscription = watch((_value, { name }) => {
          mockedFn(name, _value);
        });

        return () => {
          subscription.unsubscribe();
        };
      }, [watch]);

      const addItem = (index: number) => {
        append({ firstName: '' }, { focusName: `names.${index}.firstName` });
      };

      return (
        <form>
          <button type="button" onClick={() => addItem(fields.length)}>
            append
          </button>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));
    expect(mockedFn).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('button'));
    expect(mockedFn).toHaveBeenCalledTimes(4);
  });
});
