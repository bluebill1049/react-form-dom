import { expectType } from 'tsd';

import {
  ArrayPath,
  FieldPathValues,
  Opaque,
  Path,
  PathValue,
} from '../../types';
import { _, Depth3Type } from '../__fixtures__';

/** {@link Path} */ {
  /** it should evaluate to never for an empty object */ {
    const actual = _ as Path<{}>;
    expectType<never>(actual);
  }

  /** it should evaluate to all paths of an object */ {
    const actual = _ as Path<{ foo: { bar: string; baz: string } }>;
    expectType<'foo' | 'foo.bar' | 'foo.baz'>(actual);
  }

  /** it should include paths through tuples */ {
    const actual = _ as Path<{ foo: [string, number] }>;
    expectType<'foo' | 'foo.0' | 'foo.1'>(actual);
  }

  /** it should include paths through arrays */ {
    const actual = _ as Path<{ foo: string[] }>;
    expectType<'foo' | `foo.${number}`>(actual);
  }

  /** it should be able to avoid self-referencing/recursion, not crashing on self-referencing types. */ {
    type Foo = { foo: Foo };
    const actual = _ as Path<Foo>;
    expectType<'foo'>(actual);
  }

  /** it should not erroneously match subtypes as traversed */ {
    type Foo =
      | {
          foo?: Foo;
          bar?: {
            baz: 1;
          };
        }
      | {};
    const actual = _ as Path<Foo>;
    expectType<'foo' | 'bar' | 'bar.baz'>(actual);
  }

  /** it should not traverse into opaque types */ {
    type Foo = Opaque<{
      foo: 'bar';
    }>;

    const actual = _ as Path<{ foo: Foo; bar: Foo }>;
    expectType<'foo' | 'bar'>(actual);
  }
}

/** {@link ArrayPath} */ {
  /** it should evaluate to all paths pointing to a non-primitive array */ {
    const actual = _ as ArrayPath<{
      foo: Array<{ bar: string[]; baz: string[] }>;
    }>;
    expectType<'foo'>(actual);
  }

  /** it should include paths through tuples */ {
    const actual = _ as ArrayPath<{ foo: [object[], object[]] }>;
    expectType<'foo' | 'foo.0' | 'foo.1'>(actual);
  }

  /** it should include paths through arrays */ {
    const actual = _ as ArrayPath<{ foo: string[][][] }>;
    expectType<'foo' | `foo.${number}`>(actual);
  }

  /** it should be able to avoid self-referencing/recursion, not crashing on self-referencing types. */ {
    type Foo = { foo: Foo[] };
    const actual = _ as ArrayPath<Foo>;
    expectType<'foo'>(actual);
  }

  /** it should not erroneously match subtypes as traversed */ {
    type Foo =
      | {
          bar?: {
            baz?: 1;
            fooArr?: Foo[];
          };
        }
      | {};
    const actual = _ as ArrayPath<Foo>;
    expectType<'bar.fooArr'>(actual);
  }
}

/** {@link PathValue} */ {
  /** it should traverse an object */ {
    const actual = _ as PathValue<Depth3Type<number>, 'foo.foo.value'>;
    expectType<number>(actual);
  }

  /** it should traverse a tuple */ {
    const actual = _ as PathValue<Depth3Type<boolean>, 'bar.0.value'>;
    expectType<boolean>(actual);
  }

  /** it should traverse an array */ {
    const actual = _ as PathValue<Depth3Type<boolean>, 'baz.42.value'>;
    expectType<boolean>(actual);
  }
}

/** {@link FieldPathValues} */ {
  /** it should resolve all paths */ {
    const actual = _ as FieldPathValues<
      Depth3Type<string>,
      ['foo.foo.value', 'bar.0.value', 'baz.42.value']
    >;
    expectType<[string, string, string]>(actual);
  }
}
