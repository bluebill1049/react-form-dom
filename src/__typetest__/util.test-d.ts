import { expectAssignable, expectType } from 'tsd';

import { DeepPartial, ExtractObjects, IsAny, IsNever, Opaque } from '../types';

import { _ } from './__fixtures__';

/** {@link IsAny} */ {
  /** it should evaluate to true for any */ {
    const actual = _ as IsAny<any>;
    expectType<true>(actual);
  }

  /** it should evaluate to false for never */ {
    const actual = _ as IsAny<never>;
    expectType<false>(actual);
  }

  /** it should evaluate to false for unknown */ {
    const actual = _ as IsAny<unknown>;
    expectType<false>(actual);
  }

  /** it should evaluate to false for string */ {
    const actual = _ as IsAny<string>;
    expectType<false>(actual);
  }
}

/** {@link IsNever} */ {
  /** it should evaluate to false for any */ {
    const actual = _ as IsNever<any>;
    expectType<false>(actual);
  }

  /** it should evaluate to true for never */ {
    const actual = _ as IsNever<never>;
    expectType<true>(actual);
  }

  /** it should evaluate to false for unknown */ {
    const actual = _ as IsNever<unknown>;
    expectType<false>(actual);
  }

  /** it should evaluate to false for string */ {
    const actual = _ as IsNever<string>;
    expectType<false>(actual);
  }
}

/** {@link ExtractObjects} */ {
  /** it should extract all objects from a union */ {
    const actual = _ as ExtractObjects<
      { x: string } | { y: number; z: { w: number } } | number | string | null
    >;
    expectType<{ x: string } | { y: number; z: { w: number } }>(actual);
  }
}

/** {@link DeepPartial} */ {
  /** it should make all nested properties optional */ {
    const actual = _ as DeepPartial<{
      x: string;
      y: number;
      z: { w: boolean };
    }>;
    expectType<{ x?: string; y?: number; z?: { w?: boolean } }>(actual);
  }

  /** it should make all nested properties optional for union types */ {
    const actual = _ as DeepPartial<{
      x: string | number;
      y: { a: string | null } | null;
    }>;
    expectType<{
      x?: string | number;
      y?: { a?: string | null } | null;
    }>(actual);
  }

  /** it should make all nested properties optional for intersection types */ {
    const actual = _ as DeepPartial<{
      x: string;
      y: { a: string } & { b: number };
    }>;
    expectType<{
      x?: string;
      y?: { a?: string; b?: number };
    }>(actual);
  }

  /** it should not make opaque internals optional */ {
    type Foo = Opaque<{
      foo: 'bar';
    }>;
    const actual = _ as DeepPartial<{
      foo: Foo;
    }>;
    expectType<{ foo?: Foo }>(actual);
  }

  /** it should be assignable for types containing unknown */ {
    const actual = _ as { x: unknown };
    expectAssignable<DeepPartial<{ x: unknown }>>(actual);
  }
}
