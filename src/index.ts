import Logger, { LogLevel } from './Logger.js';
import Scrapper from './Scrapper.js';
import DoDate from './DoDate.js';
import yargs from 'yargs';
import { SplitType } from './Enums.js';
import { existsSync, readFileSync, PathLike } from 'fs';
import ConfData from './models/confData.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configFile: PathLike = path.resolve(
    __dirname,
    '..',
    'config',
    'data.json'
);

class CmdLineParser {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly args: any;
    private startDate: DoDate | null = null;
    private endDate: DoDate | null = null;

    constructor() {
        this.args = yargs(process.argv.slice(2)).options({
            outputDir: {
                alias: 'o',
                type: 'string',
                demandOption: true,
                description: 'Location where images should be stored.'
            },
            logLevel: {
                alias: 'l',
                choices: [
                    'none',
                    'error',
                    'standard',
                    'info',
                    'debug',
                    'trace'
                ],
                default: 'standard',
                description: 'The level of logging to output'
            },
            startDate: {
                alias: 's',
                type: 'string',
                default: new Date().toISOString(),
                description:
                    'Date to start scrapping pictures (first of a given month)'
            },
            endDate: {
                alias: 'e',
                type: 'string',
                default: null,
                description:
                    'Date to end scrapping pictures (first of a given month)'
            },
            year: {
                alias: 'y',
                type: 'boolean',
                nargs: 0,
                default: true,
                description: 'Split photos by Year'
            },
            month: {
                alias: 'm',
                type: 'boolean',
                nargs: 0,
                default: false,
                description: 'Split photos by Year/Month'
            },
            none: {
                alias: 'n',
                type: 'boolean',
                nargs: 0,
                default: false,
                description: 'All Photos will go in the same folder'
            }
        });
    }

    public async check(): Promise<boolean> {
        if (
            !(await Promise.all([
                this.args.check((data: { startDate: string }) => {
                    this.setStartDate(DoDate.parse(data.startDate));
                    if (this.startDate === null || !this.startDate.isValid()) {
                        Logger.error('invalid start date...');
                        return false;
                    }
                    return true;
                }),
                this.args.check((data: { endDate: string }) => {
                    if (data.endDate !== null && data.endDate !== '') {
                        this.setEndDate(DoDate.parse(data.endDate));
                        if (this.endDate == null || !this.endDate.isValid()) {
                            Logger.error('invalid start date...');
                            return false;
                        }
                    }
                    return true;
                })
            ]))
        )
            return false;

        if (this.endDate == null) {
            this.setEndDate(new DoDate(null)).incMonth();
        }
        if (this.startDate == null || this.endDate == null) return false;
        return true;
    }
    public parseSync() {
        this.args.parseSync();
    }
    public detach() {
        return this.args.parseSync();
    }

    public getStartDate(): DoDate {
        if (this.startDate == null) return this.setStartDate(new DoDate(null));
        return this.startDate;
    }

    public getEndDate(): DoDate {
        if (this.endDate == null) {
            const tmp = this.setEndDate(new DoDate(null));
            tmp.incMonth();
            return tmp;
        }
        return this.endDate;
    }

    private setStartDate(date: DoDate): DoDate {
        this.startDate = date;
        this.startDate.clearTime();
        this.startDate.setDate(1);
        return this.startDate;
    }

    private setEndDate(date: DoDate): DoDate {
        this.endDate = date;
        this.endDate.clearTime();
        this.endDate.setDate(1);
        return this.endDate;
    }
}

const argsSetup = new CmdLineParser();
argsSetup.check();
const args = argsSetup.detach();

//set Logging
switch (args.logLevel) {
    case 'none': {
        Logger.setLogLevel(LogLevel.NONE);
        break;
    }
    case 'error': {
        Logger.setLogLevel(LogLevel.ERROR);
        break;
    }
    case 'standard': {
        Logger.setLogLevel(LogLevel.STANDARD);
        break;
    }
    case 'info': {
        Logger.setLogLevel(LogLevel.INFO);
        break;
    }
    case 'debug': {
        Logger.setLogLevel(LogLevel.DEBUG);
        break;
    }
    case 'trace': {
        Logger.setLogLevel(LogLevel.TRACE);
        break;
    }
}

let dataConf: ConfData = new ConfData('');
if (existsSync(configFile)) {
    Logger.debug('Loaded config from data.json');
    const tmp = JSON.parse(readFileSync(configFile).toString());
    dataConf = new ConfData(tmp.authKey);
} else {
    Logger.debug('No data.json config found.');
}

let split: SplitType = SplitType.YEAR;
if (args.month) split = SplitType.MONTH;
if (args.none) split = SplitType.NONE;

Logger.debug(args);

const app: Scrapper = new Scrapper(
    dataConf.getAuthKey(),
    args.outputDir,
    split
);
app.run(argsSetup.getStartDate(), argsSetup.getEndDate());
