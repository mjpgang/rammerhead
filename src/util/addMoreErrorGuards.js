// Debug version:
// エラーを握り潰さず、完全なスタックトレースをVercel Logsへ出す

const hGuard = require('testcafe-hammerhead/lib/request-pipeline/connection-reset-guard');

const isConnectionResetError = hGuard.isConnectionResetError;

hGuard.isConnectionResetError = function (err) {
    if (
        isConnectionResetError(err) ||
        err?.code === 'ERR_INVALID_PROTOCOL' ||
        err?.code === 'ETIMEDOUT' ||
        err?.code === 'ECONNRESET' ||
        err?.code === 'EPIPE'
    ) {
        console.error(
            '[Rammerhead guarded error]',
            err?.stack || err
        );

        return true;
    }

    console.error(
        '[Rammerhead UNKNOWN ERROR]',
        err?.stack || err
    );

    // 元の挙動を維持
    return true;
};

process.on('uncaughtException', (err) => {
    console.error('========================================');
    console.error('[Rammerhead uncaughtException]');
    console.error('name:', err?.name);
    console.error('message:', err?.message);
    console.error('code:', err?.code);
    console.error('stack:');
    console.error(err?.stack || err);
    console.error('========================================');

    // 調査中なので再throwする
    throw err;
});

process.on('unhandledRejection', (reason) => {
    console.error('========================================');
    console.error('[Rammerhead unhandledRejection]');
    console.error(reason?.stack || reason);
    console.error('========================================');
});
