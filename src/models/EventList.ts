import Logger from '../Logger.js';
import Event from './Event.js';
export default class EventList {
    events: Event[] = [];
    static parse(events: any) {
        Logger.trace('EventList.parse');
        let output: EventList = new EventList();

        if (!Array.isArray(events)) {
            Logger.debug('Events is not an array.');
            return output;
        }
        for (const event of events) {
            output.addEvent(Event.parse(event));
        }
        return output;
    }

    private addEvent(event: Event) {
        this.events.push(event);
    }
}
