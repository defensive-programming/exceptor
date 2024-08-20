import { z as $z } from "https://deno.land/x/zod/mod.ts";

// FIXME: tree-shaking might work using esm.sh, but the built npm module will have problem to be used.
// export { deserializeError, serializeError } from 'https://esm.sh/serialize-error?exports=deserializeError,serializeError'

export const code = {
  permissionDenied: 'permission-denied',
  unknown: 'unknown',
  unimplemented: 'unimplemented',
  cancelled: 'cancelled',
  failedPrecondition: 'failed-precondition',
  invalidArgument: 'invalid-argument',
  unauthenticated: 'unauthenticated',
}

/**
 * This is not expected to use directly.
 * Currently, the only consumer for this is `pivot`.
 */
class Pivot {
  name = 'Pivot';
  cause: unknown;
  /**
   * @param cause － who causes the pivot
   */
  constructor(cause: unknown) {
    this.cause = cause
  }
}
/**
 * The only reason you use `pivot` is when you want to handle the task later.
 * The task will be delegated in the closest `catch`, the same promise chain's `catch` handler.
 * The concept of pivot is like point-to-point communication:
 * ```
 *  .then(a => a || pivot('later')) // pivot from here
 *  .catch($e => {
 *    if ($e instanceof Pivot) { // got the pivot
 *      if ($e.cause === 'later') doSomething()
 *    }
 *  })
 * ```
 * Note that, the task not includes an exception-like thing such as:
 * - Error
 * - Error-like object
 * - Exception
 * - Exception-like object
 * - ...
 */
export const pivot = (cause: unknown) => { throw new Pivot(cause) }

/**
 * ### Usage
 * ```
 * new AppError('message', { code?, cause?, name? ...otherDetails })
 * ```
 * The `otherDetails` will appear in `details` property of the error.
 */
export class Exception extends Error
{
  code: string; // just for supporting TS to compile
  details: Record<string, unknown>; // just for supporting TS to compile
  // ^
  //  If relying on inheritance of the `message`, `name` from `Error`,
  //  because it's a non-enumerable field,
  //  it can be a problem for the client to do some work on `Exception`
  //  such as error serialization (ie., Usually `message` will be drop off after a common serialization algorithm)
  message: string; // ^
  name: string; // ^

  constructor(
    message: string = '',
    payload: {
      code?: string,
      cause?: Error,
      name?: string,
      [key:string]: unknown
    } = {}
  ) {
    $z.string().parse(message)
    $z.object({}).parse(payload)
    super(message)

    const { code='no-code', cause, name, ...details } = payload
    this.message = message;
    this.name = name || 'Exception';
    this.code = code;
    this.details = details;
    this.cause = cause;
  }
}

/**
 * These are just an alias of `Exception`.
 * The reason for creating this is trying to make the situation more meaningful.
 *
 * For example,
 * Sometimes when we got an error from `catch`, we might want to handle that error as a failure, not an error.
 * But we still want to have the benefits that `Exception` has, such as `stack`, as a metadata in `Failure`.
 *
 * Another example is, sometimes, we might want to `reject` with a failure － `reject(new Failure(…))`
 */
export const Wrong = Exception
export const Failure = Exception;

/**
 * ### Usage
 * ---
 * If only provide `p1`, it'll just rethrow `p1` .
 * Otherwise, `throw new Exception(p1, p2)`
 */
// deno-lint-ignore no-explicit-any
export function bubble (p1: any, p2?: Record<string, unknown>): never
{
  const $e = arguments.length === 1 ? p1 : new Exception(p1, p2)
  runBeforeBubble($e)
  throw $e
}

// deno-lint-ignore no-explicit-any
let runBeforeBubble = ($e: any) => {}

// deno-lint-ignore no-explicit-any
export const beforeBubble = (cb: ($e: any) => void) => runBeforeBubble = cb