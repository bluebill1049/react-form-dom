import React from 'react';

import getProxyFormState from './logic/getProxyFormState';
import deepEqual from './utils/deepEqual';
import isFunction from './utils/isFunction';
import { createFormControl } from './logic';
import { FieldValues, FormState, UseFormProps, UseFormReturn } from './types';

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/useform) • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm) • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, watch, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   console.log(watch("example"));
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues extends FieldValues | undefined = undefined,
>(
  props: UseFormProps<TFieldValues, TContext> = {},
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  const _formControl = React.useRef<
    UseFormReturn<TFieldValues, TContext, TTransformedValues> | undefined
  >(undefined);
  const _values = React.useRef<typeof props.values>(undefined);
  const [formState, updateFormState] = React.useState<FormState<TFieldValues>>({
    isDirty: false,
    isValidating: false,
    isLoading: isFunction(props.defaultValues),
    isSubmitted: false,
    isSubmitting: false,
    isSubmitSuccessful: false,
    isValid: false,
    submitCount: 0,
    dirtyFields: {},
    touchedFields: {},
    validatingFields: {},
    errors: props.errors || {},
    disabled: props.disabled || false,
    isReady: false,
    defaultValues: isFunction(props.defaultValues)
      ? undefined
      : props.defaultValues,
  });

  if (!_formControl.current) {
    _formControl.current = {
      ...(props.formControl ? props.formControl : createFormControl(props)),
      formState,
    };
  }

  const control = _formControl.current.control;
  control._options = props;

  React.useEffect(() => {
    control._subscribe({
      formState: control._proxyFormState,
      callback: () => updateFormState({ ...control._formState }),
      reRenderRoot: true,
    });
    updateFormState((data) => ({
      ...data,
      ready: true,
    }));
  }, [control]);

  React.useEffect(
    () => control._disableForm(props.disabled),
    [control, props.disabled],
  );

  React.useEffect(() => {
    if (control._proxyFormState.isDirty) {
      const isDirty = control._getDirty();
      if (isDirty !== formState.isDirty) {
        control._subjects.state.next({
          isDirty,
        });
      }
    }
  }, [control, formState.isDirty]);

  React.useEffect(() => {
    if (props.values && !deepEqual(props.values, _values.current)) {
      control._reset(props.values, control._options.resetOptions);
      _values.current = props.values;
      updateFormState((state) => ({ ...state }));
    } else {
      control._resetDefaultValues();
    }
  }, [props.values, control]);

  React.useEffect(() => {
    if (props.errors) {
      control._setErrors(props.errors);
    }
  }, [props.errors, control]);

  React.useEffect(() => {
    if (!control._state.mount) {
      control._setValid();
      control._state.mount = true;
    }

    if (control._state.watch) {
      control._state.watch = false;
      control._subjects.state.next({ ...control._formState });
    }

    control._removeUnmounted();
  });

  React.useEffect(() => {
    props.shouldUnregister &&
      control._subjects.state.next({
        values: control._getWatch(),
      });
  }, [props.shouldUnregister, control]);

  _formControl.current.formState = getProxyFormState(formState, control);

  return _formControl.current;
}
