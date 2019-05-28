/* eslint-disable no-console */
import { createHitFunction } from '../helpers';

/**
 * Logs setTimeout calls
 *
 * @param {Source} source
 */
export function logSetTimeout(source) {
    const hit = createHitFunction(source);
    const nativeSetTimeout = window.setTimeout;
    const log = console.log.bind(console);
    function setTimeoutWrapper(callback, timeout, ...args) {
        hit();
        log(`setTimeout("${callback.toString()}", ${timeout})`);
        return nativeSetTimeout.apply(window, [callback, timeout, ...args]);
    }
    window.setTimeout = setTimeoutWrapper;
}

logSetTimeout.names = [
    'log-setTimeout',
    'setTimeout-logger.js',
];

logSetTimeout.injections = [createHitFunction];
