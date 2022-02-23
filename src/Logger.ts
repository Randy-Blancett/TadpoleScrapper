/* eslint-disable no-console */
export enum LogLevel {
    NONE = -2,
    ERROR = -1,
    STANDARD = 0,
    INFO = 1,
    DEBUG = 2,
    TRACE = 3
}

export default class Logger {
    private static needNewLine = false;
    private static logLevel: LogLevel = LogLevel.STANDARD;
    public static info(message: unknown) {
        this.rawLog(LogLevel.DEBUG, message);
    }

    static setLogLevel(logLevel: LogLevel) {
        Logger.logLevel = logLevel;
    }

    static debug(message: unknown) {
        this.rawLog(LogLevel.DEBUG, message);
    }

    static error(message: unknown) {
        this.rawLog(LogLevel.ERROR, message);
    }

    static trace(message: unknown) {
        this.rawLog(LogLevel.TRACE, message);
    }

    static log(message: unknown) {
        this.rawLog(LogLevel.STANDARD, message);
    }

    public static statusTick() {
        if (Logger.logLevel != LogLevel.STANDARD) return;
        process.stdout.write('.');
        this.needNewLine = true;
    }

    static rawLog(logLevel: LogLevel, message: unknown) {
        if (Logger.logLevel < logLevel) return;
        if (this.needNewLine) {
            process.stdout.write('\n');
            this.needNewLine = false;
        }
        switch (logLevel) {
            case LogLevel.ERROR: {
                console.error(message);
                break;
            }
            case LogLevel.STANDARD: {
                console.log(message);
                break;
            }
            case LogLevel.INFO: {
                console.info(message);
                break;
            }
            case LogLevel.DEBUG: {
                console.debug(message);
                break;
            }
            case LogLevel.TRACE: {
                console.info(message);
                break;
            }
        }
    }
}
