import React from 'react';

import generateWatchOutput from './logic/generateWatchOutput';
import cloneObject from './utils/cloneObject';
import deepEqual from './utils/deepEqual';
import {
  Control,
  DeepPartialSkipArrayKey,
  FieldPath,
  FieldPathValue,
  FieldPathValues,
  FieldValues,
  InternalFieldName,
  ReadFormState,
  UseWatchProps,
} from './types';
import { useFormContext } from './useFormContext';

/**
 * Subscribe to the entire form values change and re-render at the hook level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   defaultValue: {
 *     name: "data"
 *   },
 *   exact: false,
 * })
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(props: {
  defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
  compute?: <T>(formValues: T) => T;
}): DeepPartialSkipArrayKey<TFieldValues>;
/**
 * Custom hook to subscribe to field change and compute function to produce state update
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   name: "fieldA",
 *   compute: (formValues) => formValues.fieldA
 * })
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TComputeValues extends unknown = unknown,
>(props: {
  defaultValue?: TFieldValues;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
  compute: (formValues: TFieldValues) => TComputeValues;
}): TComputeValues;
/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   name: "fieldA",
 *   defaultValue: "default value",
 *   exact: false,
 * })
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: {
  name: TFieldName;
  defaultValue?: FieldPathValue<TFieldValues, TFieldName>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): FieldPathValue<TFieldValues, TFieldName>;
/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @param props - defaultValue, disable subscription and match exact name.
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   control,
 *   name: ["fieldA", "fieldB"],
 *   defaultValue: {
 *     fieldA: "data",
 *     fieldB: "data"
 *   },
 *   exact: false,
 * })
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
  TFieldNames extends
    readonly FieldPath<TFieldValues>[] = readonly FieldPath<TFieldValues>[],
>(props: {
  name: readonly [...TFieldNames];
  defaultValue?: DeepPartialSkipArrayKey<TFieldValues>;
  control?: Control<TFieldValues>;
  disabled?: boolean;
  exact?: boolean;
}): FieldPathValues<TFieldValues, TFieldNames>;
/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @example
 * ```tsx
 * // can skip passing down the control into useWatch if the form is wrapped with the FormProvider
 * const values = useWatch()
 * ```
 */
export function useWatch<
  TFieldValues extends FieldValues = FieldValues,
>(): DeepPartialSkipArrayKey<TFieldValues>;
/**
 * Custom hook to subscribe to field change and isolate re-rendering at the component level.
 *
 * @remarks
 *
 * [API](https://react-hook-form.com/docs/usewatch) • [Demo](https://codesandbox.io/s/react-hook-form-v7-ts-usewatch-h9i5e)
 *
 * @example
 * ```tsx
 * const { control } = useForm();
 * const values = useWatch({
 *   name: "fieldName"
 *   control,
 * })
 * ```
 */
export function useWatch<TFieldValues extends FieldValues>(
  props?: UseWatchProps<TFieldValues>,
) {
  const methods = useFormContext();
  const {
    control = methods.control,
    name,
    defaultValue,
    disabled,
    exact,
    compute,
  } = props || {};
  const _name = React.useRef(name);
  const _compute = React.useRef(compute);
  const _computeFormValues = React.useRef(undefined);

  const initialValue = control._getWatch(
    name as InternalFieldName,
    defaultValue as DeepPartialSkipArrayKey<TFieldValues>,
  );

  const [value, updateValue] = React.useState(
    compute ? compute(initialValue) : initialValue,
  );

  _name.current = name;

  React.useEffect(
    () =>
      control._subscribe({
        name: _name.current as InternalFieldName,
        formState: {
          values: true,
        } as ReadFormState,
        exact,
        callback: (formState) => {
          if (!disabled) {
            const formValues = generateWatchOutput(
              _name.current as InternalFieldName | InternalFieldName[],
              control._names,
              formState.values || control._formValues,
              false,
              defaultValue,
            );

            if (_compute.current) {
              const computedFormValues = _compute.current(formValues);

              if (!deepEqual(computedFormValues, _computeFormValues.current)) {
                updateValue(computedFormValues);
                _computeFormValues.current = computedFormValues;
              }
            } else {
              updateValue(cloneObject(formValues));
            }
          }
        },
      }),
    [control, defaultValue, disabled, exact],
  );

  React.useEffect(() => control._removeUnmounted());

  return value;
}
