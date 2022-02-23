import { JPG, MimeType, UNKNOWN } from './Enums.js';
import Logger from './Logger.js';
import Event, { EventTypes } from './models/Event.js';

export default class ImageTracker {
    private readonly event: Event;
    private readonly attatchment: number;
    private initType: MimeType = UNKNOWN.getInstance();
    private initFile: string = '';
    private files = new Map<MimeType, string>();
    private valid: boolean = false;

    constructor(event: Event, index: number) {
        this.event = event;
        this.attatchment = index;
    }

    public getFile4Mime(mime: MimeType): string | undefined {
        return this.files.get(mime);
    }

    public getAttatchment(): number {
        return this.attatchment;
    }

    public setInitFile(file: string): string {
        this.initFile = file;
        this.files.set(this.initType, file);
        return file;
    }

    public addFile(mime: MimeType, file: string): string {
        this.files.set(mime, file);
        return file;
    }

    public getInitFile(): string {
        return this.initFile;
    }

    public isValid(): boolean {
        return this.valid && this.initType !== UNKNOWN.getInstance();
    }

    getIsoCreateDate() {
        if (this.event === undefined || this.event.time === null) return '';
        return this.event.time.toISOString();
    }

    getCreateDate(): Date {
        if (this.event === undefined || this.event.time === null)
            return new Date();
        return this.event.time;
    }

    getCameraMan() {
        if (this.event === undefined) return '';
        return this.event.cameraMan;
    }

    getComment(): string {
        if (this.event === null) return '';
        return this.event.comment;
    }

    getDescription(): string {
        let output: string = '';
        if (this.event === null) return output;
        if (this.event.comment !== null) output = this.event.comment + '\n';

        if (this.event.subjects !== null) {
            let subString = '';
            for (const subject of this.event.subjects) {
                if (subject === null || subject === '') continue;
                if (subString.length > 0) subString += ', ';
                subString += subject;
            }
            if (subString.length > 0) output += subString + '\n';
        }
        if (
            this.event.location !== null &&
            this.event.location.summary !== null
        )
            output += this.event.location.summary + ' ';
        if (this.event.time !== null)
            output +=
                '(' +
                this.event.time.toLocaleDateString('en-us', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                }) +
                ')';

        if (this.event.goalLabels != null && this.event.goalLabels.length > 0)
            output += '\n\nGoals:';

        if (this.event.goalLabels !== null)
            for (const goal of this.event.goalLabels) {
                output += '\n' + goal;
            }
        return output;
    }

    getCity() {
        if (this.event === undefined || this.event.location === null) return '';
        return this.event.location.city;
    }

    getSubLocation() {
        if (this.event === undefined || this.event.location === null) return '';
        return this.event.location.subLocation;
    }

    getState(): string {
        if (this.event === undefined || this.event.location === null) return '';
        return this.event.location.state;
    }

    getCountryCode(): string {
        if (this.event === undefined || this.event.location === null) return '';
        return this.event.location.countryCode;
    }
    getCountryName(): string {
        if (this.event === undefined || this.event.location === null) return '';
        return this.event.location.getCountryName();
    }
    getSubjects(): string[] {
        if (this.event === null || this.event.subjects === null) return [];
        return this.event.subjects;
    }
    getKeywords(): string[] {
        if (this.event === null || this.event.labels === null) return [];
        return this.event.labels;
    }

    public setInitType(type: MimeType) {
        this.initType = type;
        this.valid = true;
    }
    public getInitType(): MimeType {
        return this.initType;
    }

    public getFileIterator(): IterableIterator<string> {
        return this.files.values();
    }
}
