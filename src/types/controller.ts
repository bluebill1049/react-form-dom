import React from 'react';

import { DefaultDepth } from './path/eager';
import { RegisterOptions } from './validator';
import {
  Control,
  FieldError,
  FieldPath,
  FieldPathValue,
  FieldValues,
  Noop,
  RefCallBack,
  UseFormStateReturn,
} from './';

export type ControllerFieldState = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
  isValidating: boolean;
  error?: FieldError;
};

export type ControllerRenderProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TName extends FieldPath<TFieldValues, TFieldDepth> = FieldPath<
    TFieldValues,
    TFieldDepth
  >,
> = {
  onChange: (...event: any[]) => void;
  onBlur: Noop;
  value: FieldPathValue<TFieldValues, TFieldDepth, TName>;
  disabled?: boolean;
  name: TName;
  ref: RefCallBack;
};

export type UseControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TName extends FieldPath<TFieldValues, TFieldDepth> = FieldPath<
    TFieldValues,
    TFieldDepth
  >,
> = {
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TFieldDepth, TName>,
    'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'
  >;
  shouldUnregister?: boolean;
  defaultValue?: FieldPathValue<TFieldValues, TFieldDepth, TName>;
  control?: Control<TFieldValues, TFieldDepth>;
  disabled?: boolean;
};

export type UseControllerReturn<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TName extends FieldPath<TFieldValues, TFieldDepth> = FieldPath<
    TFieldValues,
    TFieldDepth
  >,
> = {
  field: ControllerRenderProps<TFieldValues, TFieldDepth, TName>;
  formState: UseFormStateReturn<TFieldValues>;
  fieldState: ControllerFieldState;
};

/**
 * Render function to provide the control for the field.
 *
 * @returns all the event handlers, and relevant field and form state.
 *
 * @example
 * ```tsx
 * const { field, fieldState, formState } = useController();
 *
 * <Controller
 *   render={({ field, formState, fieldState }) => ({
 *     <input
 *       onChange={field.onChange}
 *       onBlur={field.onBlur}
 *       name={field.name}
 *       ref={field.ref} // optional for focus management
 *     />
 *   })}
 * />
 * ```
 */
export type ControllerProps<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TName extends FieldPath<TFieldValues, TFieldDepth> = FieldPath<
    TFieldValues,
    TFieldDepth
  >,
> = {
  render: ({
    field,
    fieldState,
    formState,
  }: {
    field: ControllerRenderProps<TFieldValues, TFieldDepth, TName>;
    fieldState: ControllerFieldState;
    formState: UseFormStateReturn<TFieldValues>;
  }) => React.ReactElement;
} & UseControllerProps<TFieldValues, TFieldDepth, TName>;
