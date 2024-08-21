import { z as $z } from "https://deno.land/x/zod/mod.ts";

// FIXME: tree-shaking might work using esm.sh, but the built npm module will have problem to be used.
// export { deserializeError, serializeError } from 'https://esm.sh/serialize-error?exports=deserializeError,serializeError'

import { deserializeError, serializeError as serializeException, isErrorLike as isExceptionLike, ErrorLike as ExceptionLike } from 'npm:serialize-error'
export { isExceptionLike, serializeException, type ExceptionLike }
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
 * new Exception('message', { code?, cause?, name? ...otherDetails })
 * ```
 * The `otherDetails` will be accessible in the property `details` of an `Exception` instance.
 *
 * Note that,
 * almost all errors thrown by V8 have a stack property, that's why Exception extending from `Error`.
 * In practice, this doesn't mean that `Exception` can only be used as an error, although it's technically an error.
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
  name: string = 'Exception' // ^
  constructor(...args: Parameters<ExceptionSignature>)
  {
    const [message = '', payload = {}] = args;
    $z.string().parse(message)
    $z.object({}).parse(payload)
    super(message)

    const { code='no-code', cause, ...details } = payload
    this.message = message;
    this.code = code;
    this.details = details;
    this.cause = serializeException(cause);
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

// deno-lint-ignore no-explicit-any
type ExceptionSignature = (p1: string, p2: Record<string, any>) => void;
/**
 * ### Return
 * ---
 * It'll always throw a serialized and exception-like object if using correctly
 * The main reason for the serialization is to make sure all the details of an exception will not lost.
 * eg., without the serialization, sending an exception over network might lose many things
 *
 * ### Usage rules
 * ---
 * Just think `bubble2` is a functional `throw`, but more powerful.
 *
 * If only `p1` is provided, it'll just rethrow `p1` if it's an exception-like,
 * otherwise an unexpected exception will be created with `cause` pointing to `p1` and throw the exception.
 *
 * If both `p1` & `p2` are provided, `p1` must be a string and `p2` must be an object.
 * An exception will be created based on `p1` and `p2` and the exception will be thrown.
 */
// deno-lint-ignore no-explicit-any
export function bubble2(p1: any): void;
/**
 * Same as the signature of `ExceptionSignature`
 */
export function bubble2 (p1: string, p2: Record<string, unknown>): void; // deno-lint-ignore no-explicit-any
export function bubble2 (p1: any, p2?: Record<string, unknown>)
{
  if (arguments.length === 1)
  {
    p1 = serializeException(p1)
    throw (
      isExceptionLike(p1) ?
      p1 :
      new Exception("Unexpected exception", { code: code.unknown, cause: p1 })
    )
  }
  else if (arguments.length === 2)
  {
    p2 = serializeException(p2)
    throw (
      typeof p1 === 'string' && typeof p2 === 'object' ?
      new Exception(p1, p2) :
      new Exception(
        "Incorrect `bubble2` usage in the case of 2 arguments",
        { code: code.invalidArgument, p1, p2 }
      )
    );
  }
}

/**
 * ### Usage
 * ---
 * If only provide `p1`, it'll just rethrow `p1` .
 * Otherwise, `throw new Exception(p1, p2)`
 */
// deno-lint-ignore no-explicit-any
export function bubble (p1: any, p2?: Record<string, any>): never
{
  const $e = arguments.length === 1 ? p1 : new Exception(p1, p2!)
  throw $e
}
