// handle the additional errors: ERR_INVALID_PROTOCOL and ETIMEDOUT
// hammerhead handled errors: ECONNRESET, EPIPE (or ECONNABORTED for windows)

const hGuard = require('testcafe-hammerhead/lib/request-pipeline/connection-reset-guard');
const isConnectionResetError = hGuard.isConnectionResetError;

hGuard.isConnectionResetError = function (err) {
    if (
        isConnectionResetError(err) ||
        err.code === 'ERR_INVALID_PROTOCOL' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNRESET' ||
        err.code === 'EPIPE'
    ) {
        return true;
    }

    console.error('Unknown crash-inducing error:', err);
    return true;
};

process.on('uncaughtException', (err) => {
    if (
        err.message.includes('ECONN') ||
        err.message.includes('EPIPE') ||
        err.message.includes('ETIMEDOUT') ||
        err.message.includes('ERR_INVALID_')
    ) {
        console.error('Avoided crash:' + err.message);
    } else {
        console.error('About to throw: ' + err.message);
        throw err;
    }
});
