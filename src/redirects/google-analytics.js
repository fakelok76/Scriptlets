import {
    hit,
    noopFunc,
    noopNull,
    noopArray,
} from '../helpers';

/**
 * @redirect google-analytics
 *
 * @description
 * Mocks Google's Analytics and Tag Manager APIs.
 * [Covers obsolete googletagmanager-gtm redirect functionality](https://github.com/AdguardTeam/Scriptlets/issues/127).
 *
 * Related UBO redirect resource:
 * https://github.com/gorhill/uBlock/blob/8cd2a1d263a96421487b39040c1d23eb01169484/src/web_accessible_resources/google-analytics_analytics.js
 *
 * **Example**
 * ```
 * ||google-analytics.com/analytics.js$script,redirect=google-analytics
 * ||googletagmanager.com/gtm.js$script,redirect=googletagmanager-gtm
 * ```
 */
export function GoogleAnalytics(source) {
    // eslint-disable-next-line func-names
    const Tracker = function () { }; // constructor
    const proto = Tracker.prototype;
    proto.get = noopFunc;
    proto.set = noopFunc;
    proto.send = noopFunc;

    const googleAnalyticsName = window.GoogleAnalyticsObject || 'ga';
    // a -- fake arg for 'ga.length < 1' antiadblock checking
    // eslint-disable-next-line no-unused-vars
    function ga(a) {
        const len = arguments.length;
        if (len === 0) {
            return;
        }
        // eslint-disable-next-line prefer-rest-params
        const lastArg = arguments[len - 1];

        let replacer;
        if (lastArg instanceof Object
            && lastArg !== null
            && typeof lastArg.hitCallback === 'function') {
            replacer = lastArg.hitCallback;
        } else if (typeof lastArg === 'function') {
            // https://github.com/AdguardTeam/Scriptlets/issues/98
            replacer = () => {
                lastArg(ga.create());
            };
        }

        try {
            setTimeout(replacer, 1);
            // eslint-disable-next-line no-empty
        } catch (ex) { }
    }

    ga.create = () => new Tracker();
    // https://github.com/AdguardTeam/Scriptlets/issues/134
    ga.getByName = () => new Tracker();
    ga.getAll = noopArray;
    ga.remove = noopFunc;
    ga.loaded = true;
    window[googleAnalyticsName] = ga;

    const { dataLayer, google_optimize } = window; // eslint-disable-line camelcase
    if (dataLayer instanceof Object === false) {
        return;
    }

    if (dataLayer.hide instanceof Object
        && typeof dataLayer.hide.end === 'function') {
        dataLayer.hide.end();
    }

    if (typeof dataLayer.push === 'function') {
        dataLayer.push = (data) => {
            if (data instanceof Object && typeof data.eventCallback === 'function') {
                setTimeout(data.eventCallback, 1);
            }
        };
    }

    // https://github.com/AdguardTeam/Scriptlets/issues/81
    if (google_optimize instanceof Object && typeof google_optimize.get === 'function') { // eslint-disable-line camelcase
        const googleOptimizeWrapper = { };
        googleOptimizeWrapper.get = noopFunc;

        window.google_optimize = googleOptimizeWrapper;
    }

    hit(source);
}

GoogleAnalytics.names = [
    'google-analytics',
    'ubo-google-analytics_analytics.js',
    'google-analytics_analytics.js',
    // https://github.com/AdguardTeam/Scriptlets/issues/127
    'googletagmanager-gtm',
    'ubo-googletagmanager_gtm.js',
    'googletagmanager_gtm.js',
];

GoogleAnalytics.injections = [
    hit,
    noopFunc,
    noopNull,
    noopArray,
];
