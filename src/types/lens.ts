import { FieldValues } from './fields';
import { Control, UseFormRegisterReturn } from './form';
import { Path, PathValue } from './path';
import { RegisterOptions } from './validator';

export interface HookFormLens<T> {
  name: string;
  control: Control;
  register(options: RegisterOptions): UseFormRegisterReturn;
  transform: <T2>(
    getter: (original: LensFocus<T>) => T2,
  ) => Lens<UnwrapLensDeep<T2>>;
}

export interface LensFocus<T> {
  focus: <P extends Path<Exclude<T, null | undefined>>>(
    path: P,
  ) => Lens<
    Exclude<PathValue<T, P>, null | undefined> extends any[]
      ? Exclude<PathValue<T, P>, null | undefined>
      : PathValue<T, P>
  >;
}

export interface ArrayLens<U> {
  map<R>(
    callbackfn: (value: Lens<U>, index: number, array: Lens<U[]>) => R,
  ): R[];
}

export type Lens<T> = HookFormLens<T> &
  (Exclude<T, undefined | null> extends FieldValues ? LensFocus<T> : unknown) &
  (Exclude<T, undefined | null> extends (infer U)[] ? ArrayLens<U> : unknown);

export type UnwrapLens<T> = T extends Lens<infer U> ? U : never;
export type UnwrapLensDeep<T> = {
  [P in keyof T]: UnwrapLens<T[P]>;
};
