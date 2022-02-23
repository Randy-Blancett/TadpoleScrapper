export default class ConfData {
    private readonly authKey: string;

    constructor(authKey: string) {
        this.authKey = authKey;
    }

    public getAuthKey(): string {
        return this.authKey;
    }
}
