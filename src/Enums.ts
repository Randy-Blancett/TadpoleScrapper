export enum SplitType {
    YEAR,
    MONTH,
    NONE
}

export interface MimeType {
    getContentType(): string;
    getExtention(): string;
}

export class UNKNOWN implements MimeType {
    private static readonly self = new UNKNOWN();
    public static getInstance(): UNKNOWN {
        return this.self;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
    getContentType(): string {
        return 'unknown';
    }
    getExtention(): string {
        return 'ukn';
    }
}
export class JPG implements MimeType {
    private static readonly self = new JPG();
    public static getInstance(): JPG {
        return this.self;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
    getExtention(): string {
        return 'jpg';
    }
    getContentType(): string {
        return 'image/jpeg';
    }
}

export class PNG implements MimeType {
    private static readonly self = new PNG();
    public static getInstance(): PNG {
        return this.self;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
    getContentType(): string {
        return 'image/png';
    }
    getExtention(): string {
        return 'png';
    }
}

export class MP4 implements MimeType {
    private static readonly self = new MP4();
    public static getInstance(): MP4 {
        return this.self;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}
    getContentType(): string {
        return 'video/mp4';
    }
    getExtention(): string {
        return 'mp4';
    }
}

export class MimeTypes {
    public static readonly JPG = JPG.getInstance();
    public static readonly PNG = PNG.getInstance();
    public static readonly MP4 = MP4.getInstance();
    public static readonly UNKNOWN = UNKNOWN.getInstance();
    private static readonly types: Set<MimeType> = new Set<MimeType>([
        MimeTypes.JPG,
        MimeTypes.PNG,
        MimeTypes.MP4
    ]);
    public static fromContentType(contentType: string | undefined): MimeType {
        for (const type of this.types) {
            if (contentType == type.getContentType()) return type;
        }
        return MimeTypes.UNKNOWN;
    }
}
