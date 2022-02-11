export default class DoDate {
    readonly date: Date;

    static parse(input:any) {
        return new DoDate(new Date(Date.parse(input)));
    }

    constructor(date: Date|null) {
        if (date === null)
            this.date = new Date();
        else
            this.date = date
    }

    incMonth() {
        this.date.setMonth(this.date.getMonth() + 1);
    }

    toISOString(){
        return this.date.toISOString();
    }
    isValid() {
        if (!(this.date instanceof Date) || isNaN(this.date.getTime()))
            return false;

        return true;
    }

    toDateString(){
        return this.date.toDateString();
    }

    clearTime() {
        this.date.setHours(0);
        this.date.setMinutes(0);
        this.date.setSeconds(0);
        this.date.setMilliseconds(0);
    }

    setDate(day: number) {
        return this.date.setDate(day);
    }

    getTime(){
        return this.date.getTime();
    }

    detatch(){
        return new Date(this.date);
    }

    clone(){
        return new DoDate(new Date(this.date));
    }
}