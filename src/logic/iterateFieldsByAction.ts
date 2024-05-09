import { FieldRefs, InternalFieldName, Ref } from '../types';
import { get } from '../utils';
import isObject from '../utils/isObject';

const iterateFieldsByAction = (
  fields: FieldRefs,
  action: (ref: Ref, name: string) => 1 | undefined | void,
  fieldsNames?: Set<InternalFieldName> | InternalFieldName[] | 0,
  abortEarly?: boolean,
  runOnAllRefs?: boolean,
) => {
  const iterationAdjustedAction = (refs: HTMLInputElement[], key: string) => {
    return refs
      .slice(0, runOnAllRefs ? undefined : 1)
      .map((ref: Ref) => action(ref, key))
      .some(Boolean);
  };

  for (const key of fieldsNames || Object.keys(fields)) {
    const field = get(fields, key);

    if (field) {
      const { _f, ...currentField } = field;
      if (_f) {
        if (
          _f.refs &&
          _f.refs[0] &&
          iterationAdjustedAction(_f.refs, key) &&
          !abortEarly
        ) {
          break;
        } else if (_f.ref && action(_f.ref, _f.name) && !abortEarly) {
          break;
        } else {
          iterateFieldsByAction(currentField, action);
        }
      } else if (isObject(currentField)) {
        iterateFieldsByAction(currentField, action);
      }
    }
  }
};

export default iterateFieldsByAction;
