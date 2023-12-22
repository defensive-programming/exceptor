// @ts-ignore: bypass TS error cuz it seems like even I can find the corresponding type definition, npm build will still fail.
import StackTrace from 'npm:stacktrace-js';
// @ts-ignore: bypass TS error cuz it seems like prepare-stack-trace doesn't have the corresponding type definition. without this, npm build will fail.
import prepareStackTrace from 'npm:prepare-stack-trace';
// @ts-ignore: bypass TS error
import consola from "npm:consola";
// @ts-ignore: bypass TS error
import Axe from 'npm:axe';
import { z as $z } from "https://deno.land/x/zod/mod.ts";


// FIXME: tree-shaking might work using esm.sh, but the built npm module will have problem to be used.
// export { deserializeError, serializeError } from 'https://esm.sh/serialize-error?exports=deserializeError,serializeError'

export const code = {
  permissionDenied: 'permission-denied',
  unknown: 'unknown',
  cancelled: 'cancelled',
  failedPrecondition: 'failed-precondition',
  invalidArgument: 'invalid-argument',
  unauthenticated: 'unauthenticated',
}

export const logger = (config: { environment: string }) =>
{
  const log = new Axe({ // Options
    // logger: consola,
    logger: console,
    appInfo: false,
    level: config.environment === 'development' ? 'trace' : 'error',
    levels: ['info','warn','error','fatal', 'debug'],
    meta: {
      show: true
    },
    silent: false
  })
  /**
   * HACK:
   * For `time` & `timeEnd`, this is inspired by another logger called "Signal".
   * Since both Axe & consola don't have that API, we built this up anyway.
   * For `debug`, if we just use `log.debug` without below configuration,
   * we "might" encounter a problem when log some objects.
   */
  log.time = console.time
  log.timeEnd = console.timeEnd // @ts-ignore: bypass TS error just for quick dev
  log.debug = e => consola.debug(e)
   // HACK: the built-in `log.info` has an issue of mutation.
   // `log.info(a, b)` will cause `b` having some metadata that related to axe.
   // @ts-ignore: bypass TS error just for quick dev
  log.info = (a, b) => b === undefined ? consola.info(a) : consola.info(a, b)
  /**
   * Doesn't support to log non-Error things, such as a normal string.
   * So `messageOrErrObj` can be string, provided `errObj` is an `Error`,
   * or only provides `messageOrErrObj` as an `Error`
   */
  log.err = (messageOrErrObj: Error | string, errObj?: Error) => StackTrace.fromError(errObj || messageOrErrObj as Error).then(stackframes =>
  {
    const message = typeof messageOrErrObj === 'string' ? messageOrErrObj : messageOrErrObj.message
    const messageTitle = `Error Message: ${message}`
    const error = typeof messageOrErrObj === 'string' ? errObj : messageOrErrObj

    console.group(messageTitle);
    (error as Error).stack = prepareStackTrace(error, stackframes)
    log.error(error)
    console.groupEnd();
  })
  log.throw = (messageOrErrObj: Error | string, payload={}) =>
  {
    const $er = typeof messageOrErrObj === 'string' ? new Exception(messageOrErrObj, payload) : messageOrErrObj
    throw $er
  }
  // WARN: enable this can create an error message in background script
  // async function hook(err, message, meta)
  // {
  //   // return early if we wish to ignore this
  //   // (this prevents recursion; see end of this fn)
  //   if (meta.ignore_hook) return;
  //   try {
  //     utils.api('log', { severity: meta.level, message })
  //   } catch (err) {
  //     log.fatal(err, { ignore_hook: true });
  //   }
  // }

  // ['info', 'warn'].map(e => log.post(e, hook))
  return log
};

/**
 * ### Usage
 * ```
 * new AppError('message', { code?, cause?, name? ...otherDetails })
 * ```
 * The `otherDetails` will appear in `details` property of the error.
 */
export class Exception extends Error
{
  name: string;
  code: string; // just for supporting TS to compile
  details: Record<string, unknown>; // just for supporting TS to compile
  cause: unknown;

  constructor(
    message: string,
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

    this.name = name || 'Exception';
    this.code = code;
    this.details = details;
    this.cause = cause;
  }
}

export const Wrong = Exception
export const Failure = Exception;

/**
 * ### Usage
 * ---
 * If only provide `p1`, it'll just rethrow `p1` .
 * Otherwise, `throw new Exception(p1, p2)`
 */
// deno-lint-ignore no-explicit-any
export function bubble (p1: any, p2?: Record<string, unknown>)
{
  throw arguments.length === 1 ? p1 : new Exception(p1, p2)
}