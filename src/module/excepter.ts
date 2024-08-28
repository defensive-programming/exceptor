// TBD: function: `logException`
// This is for the situation like this:
// sometimes i can do: `console.error('[LOGGER]: Fail init Sentry in MAIN:', serializeException(e))`
// but actually i can also do: `console.error(new Exception('Fail init Sentry in MAIN', { cause: e }))`
// both are tedious, why not just:
// `logException('Fail init Sentry in MAIN', { cause: e })`
//
// but i need to think more on this, cuz this can mean that:
// - i may need to embed logger within bug-fucker
// - what's the logging level for `logException`?
//   - if it's not always "error", then how can I adjust it? create another function for dealing with different kind of logging level?
//   - or maybe we just implement all these things literally on Logger?
//     - eg., every kind of logging level method (eg., warn, info, ...) implement Report Interface
//
// but is this weird that I log error level thing but not use exception for that?
// i guess this counts down to the fact that how I want to report thing, right?
// but this case is also very special, cuz that is under the situation that Sentry doesn't work.
//
// if inventing all these things are not easy, maybe we can mimic the concept of scope came from Sentry,
// so that we don't need so many different kinds of APIs?

import { zod } from "./../dependency/index.ts";

// FIXME: tree-shaking might work using esm.sh, but the built npm module will have problem to be used.
// export { deserializeError, serializeError } from 'https://esm.sh/serialize-error?exports=deserializeError,serializeError'
import * as U from './aider.ts';
import { deserializeError as deserializeException, serializeError as serializeException, isErrorLike as isExceptionLike } from './serialize-error/index.js';
import type { ErrorLike as ExceptionLike } from './serialize-error/index.d.ts';
export { isExceptionLike, serializeException, type ExceptionLike, deserializeException };
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
    zod.string().parse(message)
    zod.object({}).parse(payload)
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

type DesignBubbleOptions = {
  beforeThrow?: ($e: Exception) => void;
  willThrow: boolean;
  shouldLogException: boolean;
}

export const designBubble = ($o: DesignBubbleOptions) =>
{
  // deno-lint-ignore no-explicit-any
  function bubble(p1: any): never;
  /**
   * Same as the signature of `ExceptionSignature`
   */
  function bubble (p1: string, p2: Record<string, unknown>): never; // deno-lint-ignore no-explicit-any
  function bubble (p1: any, p2?: Record<string, unknown>)
  {
    const doBubble = ($e: Exception) =>
    {
      if (U.is('function', $o.beforeThrow)) $o.beforeThrow($e);
      if ($o.shouldLogException) { console.error('bubble: ', $e); }
      if ($o.willThrow) { throw $e; }
    }
    if (arguments.length === 1)
    {
      p1 = serializeException(p1);
      const $e = isExceptionLike(p1) ? p1 : new Exception("Unexpected exception", { code: code.unknown, cause: p1 });
      return doBubble($e)
    }
    else if (arguments.length === 2)
    {
      p2 = serializeException(p2);
      if (U.is('string', p1) && U.is('object', p2)) return doBubble(new Exception(p1, p2))
      throw new Exception(
        "Invalid API usage on `bubble` in the case of 2 arguments",
        { code: code.invalidArgument, p1, p2 }
      );
    }
  }
  return bubble;
}
// Sentry.captureException($v, { extra: { functionName: 'integrateNotion' } })

/**
 * ### Return
 * ---
 * It'll always throw a serialized and exception-like object if using correctly
 * The main reason for the serialization is to make sure all the details of an exception will not lost.
 * eg., without the serialization, sending an exception over network might lose many things
 *
 * ### Usage rules
 * ---
 * Just think `bubble` is a functional `throw`, but more powerful.
 *
 * If only `p1` is provided, it'll just rethrow `p1` if it's an exception-like,
 * otherwise an unexpected exception will be created with `cause` pointing to `p1` and throw the exception.
 *
 * If both `p1` & `p2` are provided, `p1` must be a string and `p2` must be an object.
 * An exception will be created based on `p1` and `p2` and the exception will be thrown.
 */
export const bubble = designBubble({
  willThrow: true,
  shouldLogException: false
})
