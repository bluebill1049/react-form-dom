import { VALIDATION_MODE } from '../constants';
import {
  FieldValues,
  FormState,
  InternalFieldName,
  ReadFormState,
} from '../types';
import isEmptyObject from '../utils/isEmptyObject';

export default <T extends FieldValues, K extends ReadFormState>(
  formStateData: Partial<FormState<T>> & {
    name?: InternalFieldName;
    values?: T;
  },
  _proxyFormState: K,
  updateFormState: (formState: Partial<FormState<T>>) => void,
  isRoot?: boolean,
) => {
  updateFormState(formStateData);
  const { name, ...formState } = formStateData;

  return (
    isEmptyObject(formState) ||
    Object.keys(formState).length >= Object.keys(_proxyFormState).length ||
    Object.keys(formState).find(
      (key) =>
        _proxyFormState[key as keyof ReadFormState] ===
        (!isRoot || VALIDATION_MODE.all),
    )
  );
};
