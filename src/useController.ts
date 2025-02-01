import React from 'react';

import getEventValue from './logic/getEventValue';
import isNameInFieldArray from './logic/isNameInFieldArray';
import cloneObject from './utils/cloneObject';
import get from './utils/get';
import isBoolean from './utils/isBoolean';
import isUndefined from './utils/isUndefined';
import set from './utils/set';
import { EVENTS } from './constants';
import {
  ControllerFieldState,
  Field,
  FieldPath,
  FieldPathValue,
  FieldValues,
  InternalFieldName,
  UseControllerProps,
  UseControllerReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useFormState } from './useFormState';
import { useWatch } from './useWatch';

/**
 * Custom hook to work with controlled component, this function provide you with both form and field level state. Re-render is isolated at the hook level.
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usecontroller) • [Demo](https://codesandbox.io/s/usecontroller-0o8px)
 *
 * @param props - the path name to the form field value, and validation rules.
 *
 * @returns field properties, field and form state. {@link UseControllerReturn}
 *
 * @example
 * ```tsx
 * function Input(props) {
 *   const { field, fieldState, formState } = useController(props);
 *   return (
 *     <div>
 *       <input {...field} placeholder={props.name} />
 *       <p>{fieldState.isTouched && "Touched"}</p>
 *       <p>{formState.isSubmitted ? "submitted" : ""}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useController<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(
  props: UseControllerProps<TFieldValues, TName>,
): UseControllerReturn<TFieldValues, TName> {
  const methods = useFormContext<TFieldValues>();
  const { name, disabled, control = methods.control, shouldUnregister } = props;
  const isArrayField = isNameInFieldArray(control._names.array, name);
  const value = useWatch({
    control,
    name,
    defaultValue: get(
      control._formValues,
      name,
      get(control._defaultValues, name, props.defaultValue),
    ),
    exact: true,
  }) as FieldPathValue<TFieldValues, TName>;
  const formState = useFormState({
    control,
    name,
    exact: true,
  });

  const _props = React.useRef(props);
  const _registerProps = React.useRef(
    control.register(name, {
      ...props.rules,
      value,
      ...(isBoolean(props.disabled) ? { disabled: props.disabled } : {}),
    }),
  );

  const fieldState = React.useMemo(
    () =>
      Object.defineProperties(
        {},
        {
          invalid: {
            enumerable: true,
            get: () => !!get(formState.errors, name),
          },
          isDirty: {
            enumerable: true,
            get: () => !!get(formState.dirtyFields, name),
          },
          isTouched: {
            enumerable: true,
            get: () => !!get(formState.touchedFields, name),
          },
          isValidating: {
            enumerable: true,
            get: () => !!get(formState.validatingFields, name),
          },
          error: {
            enumerable: true,
            get: () => get(formState.errors, name),
          },
        },
      ) as ControllerFieldState,
    [formState, name],
  );

  const onChange = React.useCallback(
    (event: any) =>
      _registerProps.current.onChange({
        target: {
          value: getEventValue(event),
          name: name as InternalFieldName,
        },
        type: EVENTS.CHANGE,
      }),
    [name],
  );

  const onBlur = React.useCallback(
    () =>
      _registerProps.current.onBlur({
        target: {
          value: get(control._formValues, name),
          name: name as InternalFieldName,
        },
        type: EVENTS.BLUR,
      }),
    [name, control._formValues],
  );

  const ref = React.useCallback(
    (elm: any) => {
      const field = get(control._fields, name);

      if (field && elm) {
        field._f.ref = {
          focus: () => elm.focus(),
          select: () => elm.select(),
          setCustomValidity: (message: string) =>
            elm.setCustomValidity(message),
          reportValidity: () => elm.reportValidity(),
        };
      }
    },
    [control._fields, name],
  );

  const field = React.useMemo(
    () => ({
      name,
      value,
      ...(isBoolean(disabled) || formState.disabled
        ? { disabled: formState.disabled || disabled }
        : {}),
      onChange,
      onBlur,
      ref,
    }),
    [name, disabled, formState.disabled, onChange, onBlur, ref, value],
  );

  React.useEffect(() => {
    const _shouldUnregisterField =
      control._options.shouldUnregister || shouldUnregister;

    control.register(name, {
      ..._props.current.rules,
      ...(isBoolean(_props.current.disabled)
        ? { disabled: _props.current.disabled }
        : {}),
    });

    const updateMounted = (name: InternalFieldName, value: boolean) => {
      const field: Field = get(control._fields, name);

      if (field && field._f) {
        field._f.mount = value;
      }
    };

    updateMounted(name, true);

    if (_shouldUnregisterField) {
      const value = cloneObject(get(control._options.defaultValues, name));
      set(control._defaultValues, name, value);
      if (isUndefined(get(control._formValues, name))) {
        set(control._formValues, name, value);
      }
    }

    !isArrayField && control.register(name);

    return () => {
      (
        isArrayField
          ? _shouldUnregisterField && !control._state.action
          : _shouldUnregisterField
      )
        ? control.unregister(name)
        : updateMounted(name, false);
    };
  }, [name, control, isArrayField, shouldUnregister]);

  React.useEffect(() => {
    control._setDisabledField({
      disabled,
      name,
    });
  }, [disabled, name, control]);

  return React.useMemo(
    () => ({
      field,
      formState,
      fieldState,
    }),
    [field, formState, fieldState],
  );
}
