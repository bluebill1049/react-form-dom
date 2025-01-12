import { useMemo } from 'react';

import { Control, FieldValues, Lens, Path, RegisterOptions } from './types';

type Cache = Map<string, LensImpl<any>>;

export function useLens<TFieldValues extends FieldValues = FieldValues>(props: {
  control: Control<TFieldValues>;
}) {
  return useMemo(() => {
    const cache: Cache = new Map();
    const lensImpl = new LensImpl(
      '',
      props.control,
      cache,
    ) as unknown as Lens<TFieldValues>;
    return lensImpl;
  }, [props.control]);
}

class LensImpl<T extends FieldValues> {
  public name: string;
  public control: Control<T>;
  private cache: Cache;

  constructor(name: string, control: Control<T>, cache: Cache) {
    this.name = name;
    this.control = control;
    this.cache = cache;
  }

  public focus(path: string) {
    const nestedPath = this.name === '' ? path : `${this.name}.${path}`;

    if (!this.cache.has(nestedPath)) {
      this.cache.set(
        nestedPath,
        new LensImpl(nestedPath, this.control as any, this.cache),
      );
    }

    return this.cache.get(nestedPath);
  }

  public transform(getter: Function) {
    const newFields = getter(this);

    return {
      focus: (path: string) => newFields[path],
    };
  }

  public register(options: RegisterOptions<T>) {
    return this.control.register(this.name as Path<T>, options);
  }

  public map<R>(
    mapper: (value: Lens<T>, index: number, array: Lens<T[]>) => R,
  ): R[] {
    const fields = this.control._getFieldArray(this.name);

    return fields.map((value, index) => {
      const field = this.focus(index.toString());
      const res = mapper(field as any, value as any, this as any);
      return res;
    });
  }
}
