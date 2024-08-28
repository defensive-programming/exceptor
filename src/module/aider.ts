import { zod } from "./../dependency/index.ts";

type Types = 'object' | 'boolean' | 'array' | 'string' | 'function';

type ExtractType<T extends Types> =
  T extends 'object' ? object :
  T extends 'boolean' ? boolean : // deno-lint-ignore no-explicit-any
  T extends 'array' ? any[] :
  T extends 'string' ? string :   // deno-lint-ignore no-explicit-any
  T extends 'function' ? (...args: any[]) => any :
  never;

export const is = <T extends Types>(type: T, value: unknown): value is ExtractType<T> =>
{
  const shapeMap: Record<Types, unknown> = {
    object: {},
    boolean: undefined, // HACK: just to make below API work
    array: zod.any(), // usage: `its('array', value)`
    string: undefined, // HACK: just to make below API work
    function: zod.function()
  };
  // HACK: Use type assertion to specify that zod[type] is a callable function to avoid TS error.
  // deno-lint-ignore no-explicit-any
  const method = zod[type] as (...args: any[]) => any;
  return method(shapeMap[type]).safeParse(value).success;
}