import React from 'react';
import {
  act as actComponent,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { act, renderHook } from '@testing-library/react-hooks';

import { Controller } from '../../controller';
import { Control, UseFormRegister, UseFormReturn } from '../../types';
import { useController } from '../../useController';
import { useFieldArray } from '../../useFieldArray';
import { useForm } from '../../useForm';

jest.useFakeTimers();

describe('reset', () => {
  it('should reset the form and re-render the form', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    result.current.register('test');
    result.current.setValue('test', 'data');

    expect(result.current.formState.isSubmitted).toBeFalsy();
    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: 'data',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });

    expect(result.current.formState.isSubmitted).toBeTruthy();
    act(() => result.current.reset());
    expect(result.current.formState.isSubmitted).toBeFalsy();
  });

  it('should reset form value', () => {
    let methods: any;
    const Component = () => {
      methods = useForm<{
        test: string;
      }>();
      return (
        <form>
          <input {...methods.register('test')} />
        </form>
      );
    };
    render(<Component />);

    actComponent(() =>
      methods.reset({
        test: 'test',
      }),
    );

    expect(methods.getValues()).toEqual({
      test: 'test',
    });
  });

  it('should set array value of multiple checkbox inputs correctly', async () => {
    const Component = () => {
      const { register } = useForm<{
        test: string[];
      }>({
        defaultValues: {
          test: ['1', '2'],
        },
      });

      return (
        <>
          <input type="checkbox" value={'1'} {...register('test')} />
          <input type="checkbox" value={'2'} {...register('test')} />
        </>
      );
    };

    render(<Component />);

    screen
      .getAllByRole('checkbox')
      .forEach((checkbox) =>
        expect((checkbox as HTMLInputElement).checked).toBeTruthy(),
      );
  });

  it('should reset the form if ref is HTMLElement and parent element is not form', async () => {
    const mockReset = jest.spyOn(window.HTMLFormElement.prototype, 'reset');
    let methods: UseFormReturn<{
      test: string;
    }>;
    const Component = () => {
      methods = useForm<{
        test: string;
      }>();
      return <input {...methods.register('test')} />;
    };
    render(<Component />);

    actComponent(() => methods.reset());

    expect(mockReset).not.toHaveBeenCalled();
  });

  it('should set default value if values is specified to first argument', async () => {
    const { result } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');

    act(() => result.current.reset({ test: 'test' }));

    expect(result.current.control._defaultValues).toEqual({
      test: 'test',
    });
  });

  it('should reset unmountFieldsState value when shouldUnregister set to false', () => {
    const { result } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');

    act(() => result.current.reset({ test: 'test' }));
  });

  it('should not reset unmountFieldsState value by default', () => {
    const { result } = renderHook(() =>
      useForm<{
        test: string;
      }>(),
    );

    result.current.register('test');

    act(() => result.current.reset({ test: 'test' }));
  });

  it('should not reset form values when keepValues is specified', () => {
    const Component = () => {
      const { register, reset } = useForm();

      return (
        <>
          <input {...register('test')} />
          <button
            type={'button'}
            onClick={() =>
              reset(undefined, {
                keepValues: true,
              })
            }
          >
            reset
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'test',
    );
  });

  it('should not reset form defaultValues when keepDefaultValues is specified', async () => {
    const Component = () => {
      const {
        register,
        reset,
        formState: { isDirty },
      } = useForm({
        defaultValues: {
          test: 'test1',
        },
      });

      return (
        <>
          <input {...register('test')} />
          <p>{isDirty ? 'dirty' : ''}</p>
          <button
            type={'button'}
            onClick={() =>
              reset(undefined, {
                keepValues: true,
              })
            }
          >
            reset
          </button>
        </>
      );
    };

    render(<Component />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.click(screen.getByRole('button'));

    expect((screen.getByRole('textbox') as HTMLInputElement).value).toEqual(
      'test',
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test2',
      },
    });

    expect(await screen.findByText('dirty')).toBeVisible();

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test1',
      },
    });

    expect(screen.queryByText('dirty')).not.toBeInTheDocument();
  });

  it('should update dirty and dirtyFields when keepDefaultValues and updatedValues is provided', async () => {
    function App() {
      const {
        register,
        reset,
        formState: { isDirty, dirtyFields },
      } = useForm({
        defaultValues: {
          firstName: 'test',
        },
      });

      return (
        <form>
          <input {...register('firstName')} placeholder="First Name" />
          <p>{isDirty ? 'dirty' : 'pristine'}</p>
          <p>{JSON.stringify(dirtyFields)}</p>

          <button
            type="button"
            onClick={() => {
              reset(
                {
                  firstName: 'other',
                },
                {
                  keepDefaultValues: true,
                },
              );
            }}
          >
            test
          </button>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText('dirty')).toBeVisible();
    expect(screen.getByText('{"firstName":true}')).toBeVisible();
  });

  it('should not reset if keepStateOption is specified', async () => {
    let formState = {};
    const onSubmit = jest.fn();

    const App = () => {
      const {
        register,
        handleSubmit,
        reset,
        formState: { touchedFields, errors, isDirty },
      } = useForm<{ test: string }>({
        defaultValues: {
          test: '',
        },
      });

      formState = { touchedFields, errors, isDirty };

      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <input {...register('test', { required: true, minLength: 3 })} />
          <button>submit</button>
          <button
            onClick={() => {
              reset(
                { test: '' },
                {
                  keepErrors: true,
                  keepDirty: true,
                  keepIsSubmitted: true,
                  keepTouched: true,
                  keepSubmitCount: true,
                },
              );
            }}
            type={'button'}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.change(screen.getByRole('textbox'), {
      target: {
        value: 'test',
      },
    });

    fireEvent.blur(screen.getByRole('textbox'));

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    await waitFor(() =>
      expect(formState).toEqual({
        errors: {},
        isDirty: true,
        touchedFields: {
          test: true,
        },
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'reset' }));

    expect(formState).toEqual({
      errors: {},
      isDirty: true,
      touchedFields: {
        test: true,
      },
    });
  });

  it('should reset field array fine with empty value', async () => {
    let data: unknown;
    const Component = () => {
      const { control, register, reset, handleSubmit } = useForm<{
        test: {
          firstName: string;
          lastName: string;
        }[];
      }>();
      const { fields } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form
          onSubmit={handleSubmit((d) => {
            data = d;
          })}
        >
          {fields.map((field, index) => (
            <div key={field.id}>
              <input {...register(`test.${index}.firstName` as const)} />
              <Controller
                control={control}
                name={`test.${index}.lastName` as const}
                render={({ field }) => <input {...field} />}
              />
            </div>
          ))}

          <button>submit</button>

          <button type={'button'} onClick={() => reset()}>
            reset
          </button>
          <button
            type={'button'}
            onClick={() =>
              reset({
                test: [{ firstName: 'test', lastName: 'test' }],
              })
            }
          >
            reset with value
          </button>
        </form>
      );
    };

    render(<Component />);

    const resetButton = screen.getByRole('button', { name: 'reset' });
    const submitButton = screen.getByRole('button', { name: 'submit' });

    fireEvent.click(resetButton);
    fireEvent.click(submitButton);

    await waitFor(() => expect(data).toEqual({}));

    fireEvent.click(screen.getByRole('button', { name: 'reset with value' }));
    fireEvent.click(submitButton);

    await waitFor(() =>
      expect(data).toEqual({
        test: [{ firstName: 'test', lastName: 'test' }],
      }),
    );
  });

  it('should return reset nested value', () => {
    const getValuesResult: unknown[] = [];

    function App() {
      const [, update] = React.useState({});
      const { register, reset, getValues } = useForm<{
        names: { name: string }[];
      }>({
        defaultValues: {
          names: [{ name: 'test' }],
        },
      });

      React.useEffect(() => {
        reset({ names: [{ name: 'Bill' }, { name: 'Luo' }] });
      }, [reset]);

      getValuesResult.push(getValues());

      return (
        <form>
          <input {...register('names.0.name')} placeholder="Name" />
          <button type={'button'} onClick={() => update({})}>
            update
          </button>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect(getValuesResult).toEqual([
      {
        names: [
          {
            name: 'test',
          },
        ],
      },
      {
        names: [
          {
            name: 'Bill',
          },
          {
            name: 'Luo',
          },
        ],
      },
      {
        names: [
          {
            name: 'Bill',
          },
          {
            name: 'Luo',
          },
        ],
      },
    ]);
  });

  it('should keep defaultValues after reset with shouldKeepDefaultValues', async () => {
    type FormValues = { test: string; test1: string };
    const ControlledInput = ({ control }: { control: Control<FormValues> }) => {
      const { field } = useController({
        name: 'test',
        control,
      });

      return <input {...field} />;
    };

    function App() {
      const { control, register, reset } = useForm<FormValues>({
        defaultValues: { test: 'test', test1: 'test1' },
      });
      const resetData = () => {
        reset(undefined, { keepDefaultValues: true });
      };

      return (
        <form>
          <ControlledInput control={control} />
          <input {...register('test1')} />
          <input type="button" onClick={resetData} value="Reset" />
        </form>
      );
    }

    render(<App />);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'data' },
    });

    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'data' },
    });

    fireEvent.click(screen.getByRole('button'));

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('test');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('test1');
  });

  describe('when reset optional props set to keepDirtyValues', () => {
    describe('with uncontrolled components', () => {
      let updatedDirtyFields: Record<string, boolean> = {};
      let updatedDirty = false;
      let submittedValue: unknown = {};

      function App() {
        const [showButton, setShowButton] = React.useState(false);
        const {
          reset,
          register,
          handleSubmit,
          formState: { dirtyFields, isDirty },
        } = useForm();

        updatedDirtyFields = dirtyFields;
        updatedDirty = isDirty;

        React.useEffect(() => {
          setTimeout(() => {
            reset(
              {
                firstName: 'bill',
                lastName: 'luo',
              },
              { keepDirtyValues: true },
            );
            setShowButton(true);
          }, 500);
        }, [reset]);

        return (
          <form
            onSubmit={handleSubmit((data) => {
              submittedValue = data;
            })}
          >
            <input {...register('firstName')} placeholder="First Name" />
            <input {...register('lastName')} placeholder="Last Name" />

            {showButton && (
              <button
                type="button"
                onClick={() => {
                  reset();
                }}
              >
                reset
              </button>
            )}
            <button>submit</button>
          </form>
        );
      }

      it('should only update new reset values', async () => {
        render(<App />);

        await waitFor(() =>
          expect(
            (screen.getByPlaceholderText('First Name') as HTMLInputElement)
              .value,
          ).toEqual('bill'),
        );

        fireEvent.click(screen.getByRole('button', { name: 'reset' }));

        expect(updatedDirtyFields).toEqual({});
        expect(updatedDirty).toBeFalsy();

        expect(
          (screen.getByPlaceholderText('First Name') as HTMLInputElement).value,
        ).toEqual('bill');

        expect(updatedDirtyFields).toEqual({});
        expect(updatedDirty).toBeFalsy();

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() =>
          expect(submittedValue).toEqual({
            firstName: 'bill',
            lastName: 'luo',
          }),
        );
      });

      it('should only update none dirty fields and keep other values updated', async () => {
        render(<App />);

        fireEvent.change(screen.getByPlaceholderText('First Name'), {
          target: {
            value: 'test',
          },
        });

        await waitFor(() =>
          expect(
            (screen.getByPlaceholderText('Last Name') as HTMLInputElement)
              .value,
          ).toEqual('luo'),
        );

        expect(updatedDirtyFields).toEqual({
          firstName: true,
        });
        expect(updatedDirty).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() =>
          expect(submittedValue).toEqual({
            firstName: 'test',
            lastName: 'luo',
          }),
        );

        fireEvent.click(screen.getByRole('button', { name: 'reset' }));

        expect(
          (screen.getByPlaceholderText('First Name') as HTMLInputElement).value,
        ).toEqual('bill');

        expect(updatedDirtyFields).toEqual({});
        expect(updatedDirty).toBeFalsy();

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() =>
          expect(submittedValue).toEqual({
            firstName: 'bill',
            lastName: 'luo',
          }),
        );
      });
    });

    describe('with controlled components', () => {
      let updatedDirtyFields: Record<string, boolean> = {};
      let updatedDirty = false;
      let submittedValue: unknown = {};

      function App() {
        const [showButton, setShowButton] = React.useState(false);
        const {
          reset,
          control,
          handleSubmit,
          formState: { dirtyFields, isDirty },
        } = useForm({
          defaultValues: {
            firstName: '',
            lastName: '',
          },
        });

        updatedDirtyFields = dirtyFields;
        updatedDirty = isDirty;

        React.useEffect(() => {
          setTimeout(() => {
            reset(
              {
                firstName: 'bill',
                lastName: 'luo',
              },
              { keepDirtyValues: true },
            );
            setShowButton(true);
          }, 500);
        }, [reset]);

        return (
          <form
            onSubmit={handleSubmit((data) => {
              submittedValue = data;
            })}
          >
            <Controller
              control={control}
              render={({ field }) => {
                return <input {...field} placeholder="First Name" />;
              }}
              name={'firstName'}
            />
            <Controller
              control={control}
              render={({ field }) => {
                return <input {...field} placeholder="Last Name" />;
              }}
              name={'lastName'}
            />

            {showButton && (
              <button
                type="button"
                onClick={() => {
                  reset();
                }}
              >
                reset
              </button>
            )}

            <button>submit</button>
          </form>
        );
      }

      it('should only update new reset values', async () => {
        render(<App />);

        await waitFor(() =>
          expect(
            (screen.getByPlaceholderText('First Name') as HTMLInputElement)
              .value,
          ).toEqual('bill'),
        );

        fireEvent.click(screen.getByRole('button', { name: 'reset' }));

        expect(updatedDirtyFields).toEqual({});
        expect(updatedDirty).toBeFalsy();

        expect(
          (screen.getByPlaceholderText('First Name') as HTMLInputElement).value,
        ).toEqual('bill');

        expect(updatedDirtyFields).toEqual({});
        expect(updatedDirty).toBeFalsy();

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() =>
          expect(submittedValue).toEqual({
            firstName: 'bill',
            lastName: 'luo',
          }),
        );
      });

      it('should only update none dirty fields and keep other values updated', async () => {
        render(<App />);

        fireEvent.change(screen.getByPlaceholderText('First Name'), {
          target: {
            value: 'test',
          },
        });

        await waitFor(() =>
          expect(
            (screen.getByPlaceholderText('Last Name') as HTMLInputElement)
              .value,
          ).toEqual('luo'),
        );

        expect(updatedDirtyFields).toEqual({
          firstName: true,
        });
        expect(updatedDirty).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() =>
          expect(submittedValue).toEqual({
            firstName: 'test',
            lastName: 'luo',
          }),
        );

        fireEvent.click(screen.getByRole('button', { name: 'reset' }));

        expect(
          (screen.getByPlaceholderText('First Name') as HTMLInputElement).value,
        ).toEqual('bill');

        expect(updatedDirtyFields).toEqual({});
        expect(updatedDirty).toBeFalsy();

        fireEvent.click(screen.getByRole('button', { name: 'submit' }));

        await waitFor(() =>
          expect(submittedValue).toEqual({
            firstName: 'bill',
            lastName: 'luo',
          }),
        );
      });
    });
  });

  it('should allow to reset unmounted field array', () => {
    type FormValues = {
      test: { name: string }[];
    };

    const FieldArray = ({
      control,
      register,
    }: {
      control: Control<FormValues>;
      register: UseFormRegister<FormValues>;
    }) => {
      const { fields, append } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <div>
          {fields.map((field, index) => {
            return (
              <input
                key={field.id}
                {...register(`test.${index}.name` as const)}
              />
            );
          })}
          <button
            onClick={() => {
              append({ name: '' });
            }}
          >
            append
          </button>
        </div>
      );
    };

    const App = () => {
      const [show, setShow] = React.useState(true);
      const { control, register, reset } = useForm<FormValues>();

      return (
        <div>
          {show && <FieldArray control={control} register={register} />}
          <button
            onClick={() => {
              setShow(!show);
            }}
          >
            toggle
          </button>
          <button
            onClick={() => {
              reset({
                test: [{ name: 'test' }],
              });
            }}
          >
            reset
          </button>
        </div>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));
    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    expect(screen.getAllByRole('textbox').length).toEqual(2);

    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getAllByRole('textbox').length).toEqual(1);
  });

  it('should only return register input when reset is invoked with shouldUnregister:true', async () => {
    let submittedData = {};

    const App = () => {
      const { reset, handleSubmit } = useForm({
        defaultValues: {
          test: 'bill',
        },
        shouldUnregister: true,
      });

      return (
        <form
          onSubmit={handleSubmit((data) => {
            submittedData = data;
          })}
        >
          <button>submit</button>
          <button
            type={'button'}
            onClick={() => {
              reset({
                test: '1234',
              });
            }}
          >
            reset
          </button>
        </form>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    expect(submittedData).toEqual({});

    fireEvent.click(screen.getByRole('button', { name: 'reset' }));

    fireEvent.click(screen.getByRole('button', { name: 'submit' }));

    expect(submittedData).toEqual({});
  });

  it('should update controlled input correctly with shouldUnregister set to true', () => {
    function App() {
      const { register, reset, control } = useForm({
        defaultValues: { uncontrolled: '', control: '' },
        shouldUnregister: true,
      });

      return (
        <form>
          <input {...register('uncontrolled')} />
          <Controller
            render={({ field }) => (
              <input
                ref={field.ref}
                value={field.value}
                onChange={field.onChange}
              />
            )}
            name="control"
            control={control}
          />

          <button
            type="button"
            onClick={() => {
              reset({ uncontrolled: 'uncontrolled', control: 'control' });
            }}
          >
            reset
          </button>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('uncontrolled');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('control');
  });

  it('should keep input values when keepValues is set to true', () => {
    function App() {
      const { register, handleSubmit, reset } = useForm();
      const [show, setShow] = React.useState(true);

      return (
        <form onSubmit={handleSubmit(() => {})}>
          <input {...register('firstName')} placeholder="First Name" />
          {show && <input {...register('lastName')} placeholder="Last Name" />}
          <button
            type="button"
            onClick={() => {
              reset({}, { keepValues: true });
            }}
          >
            reset
          </button>
          <button
            type="button"
            onClick={() => {
              setShow(!show);
            }}
          >
            toggle
          </button>
          <input type="submit" />
        </form>
      );
    }

    render(<App />);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: 'test' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: 'test' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));
    fireEvent.click(screen.getByRole('button', { name: 'reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }));

    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('test');
  });

  it('should not update isMounted when isValid is subscribed', async () => {
    const mounted: unknown[] = [];

    const App = () => {
      const { control, reset } = useForm();

      mounted.push(control._stateFlags.mount);

      React.useEffect(() => {
        reset({});
      }, [reset]);

      return <form />;
    };

    render(<App />);

    expect(mounted).toEqual([false, true]);
  });

  it('should update isMounted when isValid is subscribed', async () => {
    const mounted: unknown[] = [];
    let tempControl: Control = {} as Control;

    const App = () => {
      const {
        control,
        reset,
        formState: { isValid },
      } = useForm();

      mounted.push(control._stateFlags.mount);
      tempControl = control;

      React.useEffect(() => {
        reset({});
      }, [reset]);

      return (
        <form>
          <p>{isValid ? 'true' : 'false'}</p>
        </form>
      );
    };

    render(<App />);

    expect(await screen.findByText('false')).toBeVisible();

    expect(mounted).toEqual([false, false]);

    expect(tempControl._stateFlags.mount).toBeTruthy();
  });

  it('should reset values but keep defaultValues', async () => {
    const App = () => {
      const { register, control, reset } = useForm({
        defaultValues: {
          test: 'test',
          test1: 'test1',
        },
      });

      return (
        <>
          <input {...register('test')} />
          <Controller
            control={control}
            render={({ field }) => <input {...field} />}
            name={'test1'}
          />
          <button
            onClick={() => {
              reset(
                {
                  test: 'changed1',
                  test1: 'changed2',
                },
                { keepDefaultValues: true },
              );
            }}
          >
            reset
          </button>
          <p>{JSON.stringify(control._defaultValues)}</p>
        </>
      );
    };

    render(<App />);

    fireEvent.click(screen.getByRole('button'));

    expect(
      await screen.findByText('{"test":"test","test1":"test1"}'),
    ).toBeVisible();
    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('changed1');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('changed2');
  });

  it('should reset field array async', () => {
    let tempFields: unknown[] = [];

    function App() {
      const { control, reset } = useForm<{
        names: {
          test: string;
        }[];
      }>({
        defaultValues: {
          names: [],
        },
      });
      const { fields, append } = useFieldArray({
        control,
        name: 'names',
      });

      tempFields = fields;

      return (
        <form>
          <button
            type="button"
            onClick={() => {
              setTimeout(() => {
                reset();
              }, 100);
            }}
          >
            reset
          </button>
          <button
            type="button"
            onClick={() =>
              append({
                test: '1',
              })
            }
          >
            append
          </button>
          <ul>
            {fields.map((item, index) => (
              <Controller
                key={item.id}
                render={({ field }) => <input {...field} />}
                name={`names.${index}.test`}
                control={control}
              />
            ))}
          </ul>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'append' }));
    fireEvent.click(screen.getByRole('button', { name: 'append' }));

    fireEvent.click(screen.getByRole('button', { name: 'reset' }));

    actComponent(() => {
      jest.advanceTimersByTime(100);
    });

    expect(tempFields).toEqual([]);
  });

  it('should reset the form after submitted', async () => {
    function App() {
      const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { isDirty, dirtyFields },
      } = useForm({
        defaultValues: {
          something: 'anything',
          test: [{ firstName: 'Bill', lastName: 'Luo' }],
        },
      });
      const { fields } = useFieldArray({
        control,
        name: 'test',
      });

      return (
        <form
          onSubmit={handleSubmit((data) => {
            reset({ ...data });
          })}
        >
          <p>is dirty? {isDirty ? 'yes' : 'no'}</p>
          <p>{JSON.stringify(dirtyFields)}</p>
          <input {...register('something')} />
          <ul>
            {fields.map((item, index) => {
              return (
                <li key={item.id}>
                  <input
                    defaultValue={`${item.firstName}`}
                    {...register(`test.${index}.firstName`)}
                  />

                  <Controller
                    render={({ field }) => <input {...field} />}
                    name={`test.${index}.lastName`}
                    control={control}
                    defaultValue={item.lastName}
                  />
                </li>
              );
            })}
          </ul>

          <button>Submit</button>
        </form>
      );
    }

    render(<App />);

    fireEvent.change(screen.getAllByRole('textbox')[0], {
      target: { value: '1' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[1], {
      target: { value: '2' },
    });
    fireEvent.change(screen.getAllByRole('textbox')[2], {
      target: { value: '3' },
    });

    expect(screen.getByText(/yes/i)).toBeVisible();
    expect(
      screen.getByText(
        `{"something":true,"test":[{"firstName":true,"lastName":true}]}`,
      ),
    ).toBeVisible();

    fireEvent.click(screen.getByRole('button'));

    expect(await screen.findByText(/no/i)).toBeVisible();

    expect(
      (screen.getAllByRole('textbox')[0] as HTMLInputElement).value,
    ).toEqual('1');
    expect(
      (screen.getAllByRole('textbox')[1] as HTMLInputElement).value,
    ).toEqual('2');
    expect(
      (screen.getAllByRole('textbox')[2] as HTMLInputElement).value,
    ).toEqual('3');
  });

  it('should keep isSubmitted value when keepIsSubmitted is true', async () => {
    const { result } = renderHook(() => useForm<{ test: string }>());

    expect(result.current.formState.isSubmitted).toBeFalsy();

    await act(() => result.current.reset(undefined, { keepIsSubmitted: true }));
    expect(result.current.formState.isSubmitted).toBeFalsy();

    result.current.register('test');
    result.current.setValue('test', 'data');

    await act(async () => {
      await result.current.handleSubmit((data) => {
        expect(data).toEqual({
          test: 'data',
        });
      })({
        preventDefault: () => {},
        persist: () => {},
      } as React.SyntheticEvent);
    });

    expect(result.current.formState.isSubmitted).toBeTruthy();

    act(() => result.current.reset(undefined, { keepIsSubmitted: true }));

    expect(result.current.formState.isSubmitted).toBeTruthy();
  });

  it.only('should keep track on updated defaultValues', () => {
    function App() {
      const {
        handleSubmit,
        reset,
        formState: { defaultValues },
      } = useForm({
        defaultValues: { firstName: 'Bill', lastName: 'Luo' },
      });

      return (
        <form
          onSubmit={handleSubmit(() => {
            reset({ firstName: 'Bill1', lastName: 'Luo1' });
          })}
        >
          <button>Submit</button>
          <p>{defaultValues?.firstName}</p>
          <p>{defaultValues?.lastName}</p>
        </form>
      );
    }

    render(<App />);

    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Bill1')).toBeVisible();
    expect(screen.getByText('Luo1')).toBeVisible();
  });
});
