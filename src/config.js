const path = require('path');
const fs = require('fs');
const os = require('os');
const RammerheadJSMemCache = require('./classes/RammerheadJSMemCache.js');
const RammerheadJSFileCache = require('./classes/RammerheadJSFileCache.js');

// AbasthanのFree環境では1ポート構成にする
const enableWorkers = false;

const PORT = Number(process.env.PORT) || 8080;

module.exports = {
    //// HOSTING CONFIGURATION ////

    // Abasthanから外部公開できるよう全インターフェースで待受
    bindingAddress: '0.0.0.0',

    // Abasthanが割り当てるPORTを使用
    port: PORT,

    // Abasthanは通常1つの公開ポートなので無効化
    crossDomainPort: null,

    publicDir: path.join(__dirname, '../public'),

    // Free環境なので無駄なWorker大量起動を避ける
    enableWorkers,
    workers: 1,

    ssl: null,

    // AbasthanのHTTPSリバースプロキシ越しに動作させる
    getServerInfo: (req) => {
        const host = req.headers.host || 'localhost';

        return {
            hostname: new URL('http://' + host).hostname,
            port: 443,
            crossDomainPort: 443,
            protocol: 'https:'
        };
    },

    // セッション作成用パスワード
    password: 'sharkie4life',

    disableLocalStorageSync: false,

    restrictSessionToIP: true,

    jsCache: new RammerheadJSFileCache(
        path.join(__dirname, '../cache-js'),
        5 * 1024 * 1024 * 1024,
        50000,
        enableWorkers
    ),

    disableHttp2: false,

    //// REWRITE HEADER CONFIGURATION ////

    stripClientHeaders: [],

    rewriteServerHeaders: {},

    //// SESSION STORE CONFIG ////

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

    getIP: (req) =>
        (
            req.headers['x-forwarded-for'] ||
            req.socket.remoteAddress ||
            ''
        ).split(',')[0].trim()
};

if (fs.existsSync(path.join(__dirname, '../config.js'))) {
    Object.assign(module.exports, require('../config'));
}
