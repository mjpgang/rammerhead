const path = require('path');
const fs = require('fs');

const RammerheadJSFileCache = require('./classes/RammerheadJSFileCache.js');

// Vercelでは1プロセス・1ポート構成
const enableWorkers = false;

// VercelのPORTを使用
const PORT = Number(process.env.PORT) || 80;

module.exports = {
    //// HOSTING CONFIGURATION ////

    // Vercelのコンテナから外部アクセス可能にする
    bindingAddress: '0.0.0.0',

    // Vercelが指定するポート
    port: PORT,

    // 1ポート構成
    crossDomainPort: null,

    // 公開ファイル
    publicDir: path.join(__dirname, '../public'),

    // Workerは無効化
    enableWorkers,
    workers: 1,

    // Vercel側でHTTPS化されるため、アプリ側のSSLは無効
    ssl: null,

    // 外部公開URLの情報
    getServerInfo: (req) => {
        const forwardedHost =
            req.headers['x-forwarded-host'] ||
            req.headers.host ||
            'localhost';

        const hostname = String(forwardedHost)
            .split(',')[0]
            .trim()
            .split(':')[0];

        return {
            hostname: hostname || 'localhost',
            port: 443,
            crossDomainPort: 443,
            protocol: 'https:'
        };
    },

    // 環境変数があればそのパスワードを使用
    // Vercelの環境変数:
    // RAMMERHEAD_PASSWORD=好きなパスワード
    password: process.env.RAMMERHEAD_PASSWORD || null,

    // LocalStorage同期
    disableLocalStorageSync: false,

    // IP制限はVercelのプロキシ環境では無効化
    restrictSessionToIP: false,

    // JavaScriptキャッシュ
    jsCache: new RammerheadJSFileCache(
        path.join(__dirname, '../cache-js'),
        5 * 1024 * 1024 * 1024,
        50000,
        enableWorkers
    ),

    // HTTP/2を無効化
    disableHttp2: false,

    //// REWRITE HEADER CONFIGURATION ////

    stripClientHeaders: [],

    rewriteServerHeaders: {},

    //// SESSION STORE CONFIGURATION ////

    fileCacheSessionConfig: {
        saveDirectory: path.join(__dirname, '../sessions'),

        cacheTimeout: 1000 * 60 * 20,

        cacheCheckInterval: 1000 * 60 * 10,

        deleteUnused: true,

        staleCleanupOptions: {
            staleTimeout: 1000 * 60 * 60 * 24 * 3,
            maxToLive: null,
            staleCheckInterval: 1000 * 60 * 60 * 6
        },

        deleteCorruptedSessions: true
    },

    //// LOGGING CONFIGURATION ////

    logLevel: process.env.DEVELOPMENT ? 'debug' : 'info',

    generatePrefix: (level) =>
        `[${new Date().toISOString()}] [${level.toUpperCase()}] `,

    // Vercelの転送元IPを取得
    getIP: (req) => {
        const forwarded =
            req.headers['x-forwarded-for'] ||
            req.socket?.remoteAddress ||
            '';

        return String(forwarded)
            .split(',')[0]
            .trim();
    }
};

// ルートのconfig.jsが存在する場合はそちらを優先
if (fs.existsSync(path.join(__dirname, '../config.js'))) {
    Object.assign(module.exports, require('../config'));
}
