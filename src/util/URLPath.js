/**
 * URL helper for request paths.
 */

module.exports = class URLPath extends URL {
    /**
     * @param {string} path
     */
    constructor(path) {
        let value = String(path || '/');

        // Node/Vercel may pass an invalid proxy-style path.
        // URL requires a valid absolute or relative URL.
        if (!value.startsWith('/') && !value.startsWith('http://') && !value.startsWith('https://')) {
            value = '/' + value;
        }

        // Some Rammerhead proxy paths contain a colon in the path.
        // Encode only the problematic colon when it is not a scheme.
        if (
            value.startsWith('/') &&
            value.includes(':') &&
            !value.startsWith('/http://') &&
            !value.startsWith('/https://')
        ) {
            const firstColon = value.indexOf(':');
            const firstSlash = value.indexOf('/');

            if (firstColon > firstSlash) {
                value =
                    value.slice(0, firstColon) +
                    '%3A' +
                    value.slice(firstColon + 1);
            }
        }

        super(value, 'http://foobar');
    }

    /**
     * @param {string} param
     * @returns {string|null}
     */
    get(param) {
        return this.searchParams.get(param);
    }

    /**
     * @returns {{[param: string]: string}}
     */
    getParams() {
        return Object.fromEntries(this.searchParams);
    }
};
