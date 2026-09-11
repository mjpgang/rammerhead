const hGuard = require('testcafe-hammerhead/lib/request-pipeline/connection-reset-guard');

const isConnectionResetError = hGuard.isConnectionResetError;

hGuard.isConnectionResetError = function (err) {
    console.error(
        '[Rammerhead connection error]',
        err?.stack || err
    );

    if (
        isConnectionResetError(err) ||
        err?.code === 'ERR_INVALID_PROTOCOL' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'EPIPE'
    ) {
        return true;
    }

    return true;
};

process.on('uncaughtException', (err) => {
    console.error('========== UNCAUGHT EXCEPTION ==========');
    console.error(err?.stack || err);
    console.error('=========================================');

    throw err;
});

process.on('unhandledRejection', (reason) => {
    console.error('======= UNHANDLED REJECTION =======');
    console.error(reason?.stack || reason);
    console.error('===================================');
});
