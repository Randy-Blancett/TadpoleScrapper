import * as fs from 'fs';
import Logger from './Logger.js';
import path from 'path';
import { MimeType, SplitType } from './Enums.js';
export default class OutputHandler {
    readonly split: SplitType;
    readonly baseDir: string;

    static validateDir(dir: string) {
        Logger.trace('OutputHandler.validateDir: ' + dir);
        if (fs.existsSync(dir)) return;
        Logger.log(dir + ' does not exist Creating it...');
        fs.mkdirSync(dir, { recursive: true });
    }

    public getPathFromMime(
        mime: MimeType,
        date: Date,
        attatchment: number
    ): string {
        return this.getImagePath(
            path.resolve(this.baseDir, mime.getExtention()),
            date,
            attatchment,
            mime.getExtention()
        );
    }

    getFileName(date: Date, attatchment: number, ext: string) {
        if (date === null) {
            Logger.error('Time is null returning random file name.');
            return 'bad_' + attatchment + '.' + ext;
        }
        return date.getTime() + '_' + attatchment + '.' + ext;
    }

    getImagePath(
        baseDir: string,
        date: Date,
        attatchment: number,
        ext: string
    ): string {
        const filename = this.getFileName(date, attatchment, ext);
        let output: string = path.resolve(baseDir, filename);
        if (date == null) {
            Logger.error(
                'Time is null for the event so it will be placed in base folder.'
            );
            return output;
        }
        switch (this.split) {
            case SplitType.YEAR: {
                output = path.resolve(
                    baseDir,
                    date.getFullYear().toString(),
                    filename
                );
                break;
            }
            case SplitType.MONTH: {
                output = path.resolve(
                    baseDir,
                    date.getFullYear().toString(),
                    date.getMonth().toString(),
                    filename
                );
                break;
            }
        }
        OutputHandler.validateDir(path.dirname(output));
        return output;
    }

    constructor(baseDir: string, split: SplitType) {
        this.baseDir = baseDir;
        this.split = split;
    }
}
