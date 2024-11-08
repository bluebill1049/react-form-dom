import React from 'react';

import generateId from './logic/generateId';
import getFocusFieldName from './logic/getFocusFieldName';
import getValidationModes from './logic/getValidationModes';
import isWatched from './logic/isWatched';
import iterateFieldsByAction from './logic/iterateFieldsByAction';
import updateFieldArrayRootError from './logic/updateFieldArrayRootError';
import validateField from './logic/validateField';
import { DefaultDepth } from './types/path/eager';
import appendAt from './utils/append';
import cloneObject from './utils/cloneObject';
import convertToArrayPayload from './utils/convertToArrayPayload';
import fillEmptyArray from './utils/fillEmptyArray';
import get from './utils/get';
import insertAt from './utils/insert';
import isEmptyObject from './utils/isEmptyObject';
import moveArrayAt from './utils/move';
import prependAt from './utils/prepend';
import removeArrayAt from './utils/remove';
import set from './utils/set';
import swapArrayAt from './utils/swap';
import unset from './utils/unset';
import updateAt from './utils/update';
import { VALIDATION_MODE } from './constants';
import {
  Control,
  Field,
  FieldArray,
  FieldArrayMethodProps,
  FieldArrayPath,
  FieldArrayWithId,
  FieldErrors,
  FieldPath,
  FieldValues,
  FormState,
  InternalFieldName,
  RegisterOptions,
  UseFieldArrayProps,
  UseFieldArrayReturn,
} from './types';
import { useFormContext } from './useFormContext';
import { useSubscribe } from './useSubscribe';

/**
 * A custom hook that exposes convenient methods to perform operations with a list of dynamic inputs that need to be appended, updated, removed etc. • [Demo](https://codesandbox.io/s/react-hook-form-usefieldarray-ssugn) • [Video](https://youtu.be/4MrbfGSFY2A)
 *
 * @remarks
 * [API](https://react-hook-form.com/docs/usefieldarray) • [Demo](https://codesandbox.io/s/react-hook-form-usefieldarray-ssugn)
 *
 * @param props - useFieldArray props
 *
 * @returns methods - functions to manipulate with the Field Arrays (dynamic inputs) {@link UseFieldArrayReturn}
 *
 * @example
 * ```tsx
 * function App() {
 *   const { register, control, handleSubmit, reset, trigger, setError } = useForm({
 *     defaultValues: {
 *       test: []
 *     }
 *   });
 *   const { fields, append } = useFieldArray({
 *     control,
 *     name: "test"
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit(data => console.log(data))}>
 *       {fields.map((item, index) => (
 *          <input key={item.id} {...register(`test.${index}.firstName`)}  />
 *       ))}
 *       <button type="button" onClick={() => append({ firstName: "bill" })}>
 *         append
 *       </button>
 *       <input type="submit" />
 *     </form>
 *   );
 * }
 * ```
 */
export function useFieldArray<
  TFieldValues extends FieldValues = FieldValues,
  TFieldDepth extends number = DefaultDepth,
  TFieldArrayName extends FieldArrayPath<
    TFieldValues,
    TFieldDepth
  > = FieldArrayPath<TFieldValues, TFieldDepth>,
  TKeyName extends string = 'id',
>(
  props: UseFieldArrayProps<
    TFieldValues,
    TFieldDepth,
    TFieldArrayName,
    TKeyName
  >,
): UseFieldArrayReturn<TFieldValues, TFieldDepth, TFieldArrayName, TKeyName> {
  const methods = useFormContext();
  const {
    control = methods.control,
    name,
    keyName = 'id',
    shouldUnregister,
  } = props;
  const [fields, setFields] = React.useState(control._getFieldArray(name));
  const ids = React.useRef<string[]>(
    control._getFieldArray(name).map(generateId),
  );
  const _fieldIds = React.useRef(fields);
  const _name = React.useRef(name);
  const _actioned = React.useRef(false);

  _name.current = name;
  _fieldIds.current = fields;
  control._names.array.add(name);

  props.rules &&
    (control as Control<TFieldValues, TFieldDepth>).register(
      name as FieldPath<TFieldValues, TFieldDepth>,
      props.rules as RegisterOptions<TFieldValues, TFieldDepth>,
    );

  useSubscribe({
    next: ({
      values,
      name: fieldArrayName,
    }: {
      values?: FieldValues;
      name?: InternalFieldName;
    }) => {
      if (fieldArrayName === _name.current || !fieldArrayName) {
        const fieldValues = get(values, _name.current);
        if (Array.isArray(fieldValues)) {
          setFields(fieldValues);
          ids.current = fieldValues.map(generateId);
        }
      }
    },
    subject: control._subjects.array,
  });

  const updateValues = React.useCallback(
    <
      T extends Partial<
        FieldArrayWithId<TFieldValues, TFieldDepth, TFieldArrayName, TKeyName>
      >[],
    >(
      updatedFieldArrayValues: T,
    ) => {
      _actioned.current = true;
      control._updateFieldArray(name, updatedFieldArrayValues);
    },
    [control, name],
  );

  const append = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const appendValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = appendAt(
      control._getFieldArray(name),
      appendValue,
    );
    control._names.focus = getFocusFieldName(
      name,
      updatedFieldArrayValues.length - 1,
      options,
    );
    ids.current = appendAt(ids.current, appendValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, appendAt, {
      argA: fillEmptyArray(value),
    });
  };

  const prepend = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const prependValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = prependAt(
      control._getFieldArray(name),
      prependValue,
    );
    control._names.focus = getFocusFieldName(name, 0, options);
    ids.current = prependAt(ids.current, prependValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, prependAt, {
      argA: fillEmptyArray(value),
    });
  };

  const remove = (index?: number | number[]) => {
    const updatedFieldArrayValues: Partial<
      FieldArrayWithId<TFieldValues, TFieldDepth, TFieldArrayName, TKeyName>
    >[] = removeArrayAt(control._getFieldArray(name), index);
    ids.current = removeArrayAt(ids.current, index);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, removeArrayAt, {
      argA: index,
    });
  };

  const insert = (
    index: number,
    value:
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>[],
    options?: FieldArrayMethodProps,
  ) => {
    const insertValue = convertToArrayPayload(cloneObject(value));
    const updatedFieldArrayValues = insertAt(
      control._getFieldArray(name),
      index,
      insertValue,
    );
    control._names.focus = getFocusFieldName(name, index, options);
    ids.current = insertAt(ids.current, index, insertValue.map(generateId));
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(name, updatedFieldArrayValues, insertAt, {
      argA: index,
      argB: fillEmptyArray(value),
    });
  };

  const swap = (indexA: number, indexB: number) => {
    const updatedFieldArrayValues = control._getFieldArray(name);
    swapArrayAt(updatedFieldArrayValues, indexA, indexB);
    swapArrayAt(ids.current, indexA, indexB);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      updatedFieldArrayValues,
      swapArrayAt,
      {
        argA: indexA,
        argB: indexB,
      },
      false,
    );
  };

  const move = (from: number, to: number) => {
    const updatedFieldArrayValues = control._getFieldArray(name);
    moveArrayAt(updatedFieldArrayValues, from, to);
    moveArrayAt(ids.current, from, to);
    updateValues(updatedFieldArrayValues);
    setFields(updatedFieldArrayValues);
    control._updateFieldArray(
      name,
      updatedFieldArrayValues,
      moveArrayAt,
      {
        argA: from,
        argB: to,
      },
      false,
    );
  };

  const update = (
    index: number,
    value: FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>,
  ) => {
    const updateValue = cloneObject(value);
    const updatedFieldArrayValues = updateAt(
      control._getFieldArray<
        FieldArrayWithId<TFieldValues, TFieldDepth, TFieldArrayName, TKeyName>
      >(name),
      index,
      updateValue as FieldArrayWithId<
        TFieldValues,
        TFieldDepth,
        TFieldArrayName,
        TKeyName
      >,
    );
    ids.current = [...updatedFieldArrayValues].map((item, i) =>
      !item || i === index ? generateId() : ids.current[i],
    );
    updateValues(updatedFieldArrayValues);
    setFields([...updatedFieldArrayValues]);
    control._updateFieldArray(
      name,
      updatedFieldArrayValues,
      updateAt,
      {
        argA: index,
        argB: updateValue,
      },
      true,
      false,
    );
  };

  const replace = (
    value:
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>
      | Partial<FieldArray<TFieldValues, TFieldDepth, TFieldArrayName>>[],
  ) => {
    const updatedFieldArrayValues = convertToArrayPayload(cloneObject(value));
    ids.current = updatedFieldArrayValues.map(generateId);
    updateValues([...updatedFieldArrayValues]);
    setFields([...updatedFieldArrayValues]);
    control._updateFieldArray(
      name,
      [...updatedFieldArrayValues],
      <T>(data: T): T => data,
      {},
      true,
      false,
    );
  };

  React.useEffect(() => {
    control._state.action = false;

    isWatched(name, control._names) &&
      control._subjects.state.next({
        ...control._formState,
      } as FormState<TFieldValues>);

    if (
      _actioned.current &&
      (!getValidationModes(control._options.mode).isOnSubmit ||
        control._formState.isSubmitted)
    ) {
      if (control._options.resolver) {
        control._executeSchema([name]).then((result) => {
          const error = get(result.errors, name);
          const existingError = get(control._formState.errors, name);

          if (
            existingError
              ? (!error && existingError.type) ||
                (error &&
                  (existingError.type !== error.type ||
                    existingError.message !== error.message))
              : error && error.type
          ) {
            error
              ? set(control._formState.errors, name, error)
              : unset(control._formState.errors, name);
            control._subjects.state.next({
              errors: control._formState.errors as FieldErrors<TFieldValues>,
            });
          }
        });
      } else {
        const field: Field = get(control._fields, name);
        if (
          field &&
          field._f &&
          !(
            getValidationModes(control._options.reValidateMode).isOnSubmit &&
            getValidationModes(control._options.mode).isOnSubmit
          )
        ) {
          validateField(
            field,
            control._formValues,
            control._options.criteriaMode === VALIDATION_MODE.all,
            control._options.shouldUseNativeValidation,
            true,
          ).then(
            (error) =>
              !isEmptyObject(error) &&
              control._subjects.state.next({
                errors: updateFieldArrayRootError(
                  control._formState.errors as FieldErrors<TFieldValues>,
                  error,
                  name,
                ) as FieldErrors<TFieldValues>,
              }),
          );
        }
      }
    }

    control._subjects.values.next({
      name,
      values: { ...control._formValues },
    });

    control._names.focus &&
      iterateFieldsByAction(control._fields, (ref, key: string) => {
        if (
          control._names.focus &&
          key.startsWith(control._names.focus) &&
          ref.focus
        ) {
          ref.focus();
          return 1;
        }
        return;
      });

    control._names.focus = '';

    control._updateValid();
    _actioned.current = false;
  }, [fields, name, control]);

  React.useEffect(() => {
    !get(control._formValues, name) && control._updateFieldArray(name);

    return () => {
      (control._options.shouldUnregister || shouldUnregister) &&
        control.unregister(name as FieldPath<TFieldValues, TFieldDepth>);
    };
  }, [name, control, keyName, shouldUnregister]);

  return {
    swap: React.useCallback(swap, [updateValues, name, control]),
    move: React.useCallback(move, [updateValues, name, control]),
    prepend: React.useCallback(prepend, [updateValues, name, control]),
    append: React.useCallback(append, [updateValues, name, control]),
    remove: React.useCallback(remove, [updateValues, name, control]),
    insert: React.useCallback(insert, [updateValues, name, control]),
    update: React.useCallback(update, [updateValues, name, control]),
    replace: React.useCallback(replace, [updateValues, name, control]),
    fields: React.useMemo(
      () =>
        fields.map((field, index) => ({
          ...field,
          [keyName]: ids.current[index] || generateId(),
        })) as FieldArrayWithId<
          TFieldValues,
          TFieldDepth,
          TFieldArrayName,
          TKeyName
        >[],
      [fields, keyName],
    ),
  };
}
