"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clog_1 = require("@fdebijl/clog");
exports.CONFIG = {
    MIN_LOGLEVEL: clog_1.LOGLEVEL.DEBUG,
    MONGO_URL: 'mongodb://10.10.10.15:27017/nosedits',
    MOMENT: {
        LOCALE: 'nl'
    },
    PORT: 7676
};
