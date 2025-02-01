import isObject from './isObject';
import isPlainObject from './isPlainObject';
import isWeb from './isWeb';

export default function cloneObject<T>(data: T): T {
  let copy: any;
  const isArray = Array.isArray(data);
  const isFileListInstance =
    typeof FileList !== 'undefined' ? data instanceof FileList : false;

  if (data instanceof Date) {
    copy = new Date(data);
  } else if (data instanceof Set) {
    copy = new Set(data);
  } else if (
    !(isWeb && (data instanceof Blob || isFileListInstance)) &&
    (isArray || isObject(data))
  ) {
    copy = isArray ? [] : {};

    if (!isArray && !isPlainObject(data)) {
      copy = data;
    } else {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          copy[key] = cloneObject(data[key]);
        }
      }
    }
  } else {
    return data;
  }

  return copy;
}
