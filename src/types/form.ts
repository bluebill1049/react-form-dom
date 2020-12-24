import * as React from 'react';
import { LiteralToPrimitive, DeepPartial, DeepMap, PathFinder } from './utils';
import { Resolver } from './resolvers';
import {
  FieldName,
  FieldRefs,
  FieldValue,
  FieldValues,
  InternalFieldName,
} from './fields';
import { ErrorOption, FieldErrors } from './errors';
import { RegisterOptions } from './validator';
import { ControllerRenderProps } from './controller';
import { FieldArrayDefaultValues } from './fieldArray';
import { SubjectType } from '../utils/Subject';

declare const $NestedValue: unique symbol;

export type NestedValue<
  TValue extends unknown[] | Record<string, unknown> | Map<unknown, unknown> =
    | unknown[]
    | Record<string, unknown>
> = {
  [$NestedValue]: never;
} & TValue;

export type Message = string;

export type UnpackNestedValue<T> = T extends NestedValue<infer U>
  ? U
  : T extends Date | FileList
  ? T
  : T extends Record<string, unknown>
  ? { [K in keyof T]: UnpackNestedValue<T[K]> }
  : T;

export type DefaultValues<TFieldValues> = UnpackNestedValue<
  DeepPartial<TFieldValues>
>;

export type InternalNameSet = Set<InternalFieldName>;

export type RecordInternalNameSet = Record<string, InternalNameSet>;

export type ValidationMode = {
  onBlur: 'onBlur';
  onChange: 'onChange';
  onSubmit: 'onSubmit';
  onTouched: 'onTouched';
  all: 'all';
};

export type Mode = keyof ValidationMode;

export type SubmitHandler<TFieldValues extends FieldValues> = (
  data: UnpackNestedValue<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SubmitErrorHandler<TFieldValues extends FieldValues> = (
  errors: FieldErrors<TFieldValues>,
  event?: React.BaseSyntheticEvent,
) => any | Promise<any>;

export type SetValueConfig = Partial<{
  shouldValidate: boolean;
  shouldDirty: boolean;
}>;

export type HandleChange = (event: Event) => Promise<void | boolean>;

export type UseFormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext extends object = object
> = Partial<{
  mode: Mode;
  reValidateMode: Exclude<Mode, 'onTouched' | 'all'>;
  defaultValues: DefaultValues<TFieldValues>;
  resolver: Resolver<TFieldValues, TContext>;
  context: TContext;
  shouldFocusError: boolean;
  criteriaMode: 'firstError' | 'all';
}>;

export type FieldNamesMarkedBoolean<TFieldValues extends FieldValues> = DeepMap<
  TFieldValues,
  true
>;

export type FormStateProxy<TFieldValues extends FieldValues = FieldValues> = {
  isDirty: boolean;
  isValidating: boolean;
  dirty: FieldNamesMarkedBoolean<TFieldValues>;
  touched: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitting: boolean;
  errors: boolean;
  isValid: boolean;
};

export type ReadFormState = { [K in keyof FormStateProxy]: boolean | 'all' };

export type FormState<TFieldValues> = {
  isDirty: boolean;
  dirty: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitted: boolean;
  isSubmitSuccessful: boolean;
  submitCount: number;
  touched: FieldNamesMarkedBoolean<TFieldValues>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  errors: FieldErrors<TFieldValues>;
};

export type OmitResetState = Partial<{
  errors: boolean;
  isDirty: boolean;
  isSubmitted: boolean;
  touched: boolean;
  isValid: boolean;
  submitCount: boolean;
  dirty: boolean;
}>;

export type Control<TFieldValues extends FieldValues = FieldValues> = Pick<
  UseFormMethods<TFieldValues>,
  'register' | 'unregister' | 'setValue' | 'getValues' | 'trigger'
> & {
  isWatchAllRef: React.MutableRefObject<boolean>;
  watchFieldsRef: React.MutableRefObject<InternalNameSet>;
  isFormDirty: (name?: string, data?: unknown[]) => boolean;
  mode: Readonly<{
    isOnBlur: boolean;
    isOnSubmit: boolean;
    isOnChange: boolean;
    isOnAll: boolean;
    isOnTouch: boolean;
  }>;
  reValidateMode: Readonly<{
    isReValidateOnBlur: boolean;
    isReValidateOnChange: boolean;
  }>;
  fieldArrayDefaultValuesRef: FieldArrayDefaultValues;
  fieldArrayValuesRef: FieldArrayDefaultValues;
  formState: FormState<TFieldValues>;
  formStateRef: React.MutableRefObject<FormState<TFieldValues>>;
  formStateSubjectRef: React.MutableRefObject<
    SubjectType<Partial<FormState<TFieldValues>>>
  >;
  watchSubjectRef: React.MutableRefObject<
    SubjectType<{
      inputName?: string;
      inputValue?: unknown;
    }>
  >;
  updateIsValid: (fieldsValues: FieldValues) => void;
  validFieldsRef: React.MutableRefObject<FieldNamesMarkedBoolean<TFieldValues>>;
  fieldsWithValidationRef: React.MutableRefObject<
    FieldNamesMarkedBoolean<TFieldValues>
  >;
  fieldsRef: React.MutableRefObject<FieldRefs>;
  resetFieldArrayFunctionRef: React.MutableRefObject<
    Record<InternalFieldName, () => void>
  >;
  fieldArrayNamesRef: React.MutableRefObject<InternalNameSet>;
  readFormStateRef: React.MutableRefObject<ReadFormState>;
  defaultValuesRef: React.MutableRefObject<DefaultValues<TFieldValues>>;
  watchInternal: <T>(
    fieldNames?: string | string[],
    defaultValue?: T,
    isGlobal?: boolean,
  ) => unknown;
};

export type UseWatchRenderFunctions = Record<string, () => void>;

export type UseWatchOptions<TFieldValues extends FieldValues = FieldValues> = {
  defaultValue?: unknown;
  name?: string | string[];
  control?: Control<TFieldValues>;
};

export type SetFieldValue<TFieldValues> =
  | FieldValue<TFieldValues>
  | UnpackNestedValue<DeepPartial<TFieldValues>>
  | unknown[]
  | undefined
  | null
  | boolean;

export type InputState = {
  invalid: boolean;
  isTouched: boolean;
  isDirty: boolean;
};

export type RegisterProps =
  | {
      onChange: React.ChangeEventHandler;
      onBlur: React.ChangeEventHandler;
      ref: React.Ref<any>;
    }
  | {};

export type UseFormMethods<TFieldValues extends FieldValues = FieldValues> = {
  register(
    name: PathFinder<TFieldValues>,
    options?: RegisterOptions,
  ): RegisterProps;
  unregister(name: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  watch(): UnpackNestedValue<TFieldValues>;
  watch<TFieldName extends string, TFieldValue>(
    name: TFieldName,
    defaultValue?: TFieldName extends keyof TFieldValues
      ? UnpackNestedValue<TFieldValues[TFieldName]>
      : UnpackNestedValue<LiteralToPrimitive<TFieldValue>>,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues[TFieldName]>
    : UnpackNestedValue<LiteralToPrimitive<TFieldValue>>;
  watch<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
    defaultValues?: UnpackNestedValue<
      DeepPartial<Pick<TFieldValues, TFieldName>>
    >,
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  watch(
    names: string[],
    defaultValues?: UnpackNestedValue<DeepPartial<TFieldValues>>,
  ): UnpackNestedValue<DeepPartial<TFieldValues>>;
  setError(name: FieldName<TFieldValues>, error: ErrorOption): void;
  clearErrors(name?: FieldName<TFieldValues> | FieldName<TFieldValues>[]): void;
  setValue(
    name: FieldName<TFieldValues>,
    value: SetFieldValue<TFieldValues>,
    config?: SetValueConfig,
  ): void;
  trigger(
    name?: FieldName<TFieldValues> | FieldName<TFieldValues>[],
  ): Promise<boolean>;
  formState: FormState<TFieldValues>;
  reset: (
    values?: UnpackNestedValue<DeepPartial<TFieldValues>>,
    omitResetState?: OmitResetState,
  ) => void;
  getValues(): UnpackNestedValue<TFieldValues>;
  getValues<TFieldName extends string, TFieldValue extends unknown>(
    name: TFieldName,
  ): TFieldName extends keyof TFieldValues
    ? UnpackNestedValue<TFieldValues>[TFieldName]
    : TFieldValue;
  getValues<TFieldName extends keyof TFieldValues>(
    names: TFieldName[],
  ): UnpackNestedValue<Pick<TFieldValues, TFieldName>>;
  handleSubmit: <TSubmitFieldValues extends FieldValues = TFieldValues>(
    onValid: SubmitHandler<TSubmitFieldValues>,
    onInvalid?: SubmitErrorHandler<TFieldValues>,
  ) => (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<TFieldValues>;
};

export type UseControllerMethods<
  TFieldValues extends FieldValues = FieldValues
> = {
  field: ControllerRenderProps<TFieldValues>;
  meta: InputState;
};

export type UseFormStateProps<TFieldValues> = {
  control: Control<TFieldValues>;
};

export type UseFormStateMethods<TFieldValues> = FormState<TFieldValues>;
