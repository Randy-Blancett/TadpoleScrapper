export default class RequestError {
    private readonly _status: number;
    private readonly _text: string;
    private readonly _process: string;

    constructor(status: number, text: string, process: string) {
        this._process = process;
        this._status = status;
        this._text = text;
    }

    public get process(): string {
        return this._process;
    }
    public get status(): number {
        return this._status;
    }
    public get text(): string {
        return this._text;
    }
}