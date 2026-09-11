// Handle additional errors:
// ERR_INVALID_PROTOCOL, ETIMEDOUT, ECONNRESET and EPIPE.
//
// Hammerhead normally handles some of these errors itself.
// This file adds extra guards and prints the complete error
// including the stack trace instead of only err.message.

const hGuard = require(
    'testcafe-hammerhead/lib/request-pipeline/connection-reset-guard'
);

const originalIsConnectionResetError =
    hGuard.isConnectionResetError;

hGuard.isConnectionResetError = function (err) {
    if (!err) {
        return true;
    }

    if (
        originalIsConnectionResetError(err) ||
        err.code === 'ERR_INVALID_PROTOCOL' ||
        err.code === 'ERR_INVALID_URL' ||
        err.code === 'ETIMEDOUT' ||
        err.code === 'ECONNRESET' ||
        err.code === 'ECONNABORTED' ||
        err.code === 'EPIPE' ||
        err.code === 'EAI_AGAIN' ||
        err.code === 'ENETUNREACH' ||
        err.code === 'ECONNREFUSED'
    ) {
        console.error(
            '[Rammerhead] Network error handled:',
            {
                code: err.code,
                message: err.message,
                stack: err.stack
            }
        );

        return true;
    }

    console.error(
        '[Rammerhead] Unknown error passed to connection guard:',
        err
    );

    // Prevent the connection guard from returning false.
    return true;
};

process.on('uncaughtException', (err) => {
    if (!err) {
        return;
    }

    const code = String(err.code || '');
    const message = String(err.message || '');
    const stack = String(err.stack || '');

    const isRecoverableNetworkError =
        code === 'ERR_INVALID_PROTOCOL' ||
        code === 'ERR_INVALID_URL' ||
        code === 'ETIMEDOUT' ||
        code === 'ECONNRESET' ||
        code === 'ECONNABORTED' ||
        code === 'EPIPE' ||
        code === 'EAI_AGAIN' ||
        code === 'ENETUNREACH' ||
        code === 'ECONNREFUSED' ||
        message.includes('ECONN') ||
        message.includes('EPIPE') ||
        message.includes('ETIMEDOUT') ||
        message.includes('ERR_INVALID_');

    if (isRecoverableNetworkError) {
        console.error(
            '[Rammerhead] Prevented recoverable network crash:',
            {
                code,
                message,
                stack
            }
        );

        return;
    }

    // Do not hide important errors.
    // Print the complete stack so Vercel logs show the real file
    // and line where the error occurred.
    console.error(
        '[Rammerhead] Fatal uncaught exception:',
        {
            name: err.name,
            code,
            message,
            stack
        }
    );

    // Keep the original behavior: fatal errors still terminate
    // the process and Vercel reports the invocation failure.
    throw err;
});

process.on('unhandledRejection', (reason) => {
    console.error(
        '[Rammerhead] Unhandled promise rejection:',
        reason
    );
});
