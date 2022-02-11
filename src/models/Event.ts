import Logger from "../Logger.js";
export enum EventTypes {
    ACTIVITY = "Activity",
    DAILY_REPORT = "DailyReport",
    NOTE = "Note",
    UNKNOWN = "unknown"
}
export class EventLocation {
    readonly city: string;
    readonly countryCode: string;
    readonly state: string;
    readonly subLocation: string;
    readonly summary: string;

    constructor(
        subLocation: string,
        city: string,
        state: string,
        countryCode: string,
        summary: string
    ) {
        this.subLocation = subLocation;
        this.city = city;
        this.state = state;
        this.countryCode = countryCode;
        this.summary = summary;
    }

    public getCountryName(): string {
        if (this.countryCode === null)
            return "";
        switch (this.countryCode) {
            case "USA": {
                return "United States of America";
            }
        }
        return "";
    }
}
export default class Event {
    comment: string = "";
    actorUid: string = "";
    attachments: string[] | null = null;
    cameraMan: string = "";
    subjects: string[] | null = null;
    membersDisplay: string[] | null = null;
    labels: string[] | null = null;
    goalLabels: string[] | null = null;
    key: string = "";
    type: EventTypes | null = null;
    time: Date | null = null;
    location: EventLocation | null = null;


    public static parse(jsonData: any) {
        Logger.trace("Creating EventModel from Json Data.");
        let output: Event = new Event();
        output.comment = jsonData.comment;
        output.actorUid = jsonData.actor_uid;
        output.attachments = jsonData.attachments;
        output.membersDisplay = jsonData.members_display;
        output.labels = Event.processLables(jsonData.labels);
        output.cameraMan = jsonData.actor_display;
        output.goalLabels = Event.processLables(jsonData.c_goal_labels);
        output.key = jsonData.key;
        output.subjects = jsonData.members_display;
        output.type = this.type2Enum(jsonData.type);
        output.time = new Date(jsonData.event_time * 1000);
        output.location = this.string2Location(jsonData.location_display);
        return output;
    }

    static processLables(labels: string[]) {
        let output: string[] = [];
        if (labels == null)
            return output;
        for (const label of labels) {
            let words = label.trim().split(" ");
            for (let i = 0; i < words.length; i++) {
                if (words[i].trim().length < 1)
                    continue;
                words[i] = words[i][0].toUpperCase() + words[i].substring(1).replace("\\", '&').replace("/", '&');
            }
            output.push(words.join(" "));
        }
        return output;
    }

    static string2Location(location: string): EventLocation | null {
        if (location === undefined || location.length < 1)
            return null;
        switch (location) {
            case "Goddard Mt Airy": {
                return new EventLocation("Goddard",
                    "Mt. Airy",
                    "Maryland",
                    "USA",
                    location);
            }
        }
        Logger.error("Unknown Location: " + location);
        return null;
    }

    static type2Enum(type: string) {
        for (const event in EventTypes) {
            if ((<any>EventTypes)[event] == type)
                return (<any>EventTypes)[event];
        }
        Logger.log(type + ": has no Enum Value.");
        Logger.trace(" - Event.type2Enum");
        return EventTypes.UNKNOWN;
    }
}