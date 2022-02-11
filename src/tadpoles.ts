import axios, {AxiosInstance, AxiosResponse } from "axios";
import * as fs from 'fs';
import { MimeTypes } from "./Enums.js";
import ImageTracker from "./ImageTracker.js";
import Logger from "./Logger.js";
import EventList from "./models/EventList.js";
import RequestError from "./models/RequestError.js";

export default class Tadpoles {
    authorization: string = "";
    interface: AxiosInstance = axios.create({
        baseURL: 'https://www.tadpoles.com',
        timeout: 15000,
        maxRedirects: 10
    });

    public login(authString: string) {
        Logger.trace("login");
        this.authorization = authString;
        this.interface.defaults.headers.common['Cookie'] = this.authorization;
    }

    public async getPictureIndex(start: Date, end: Date) {
        Logger.trace("Tadpoles.getPictureIndex");
        Logger.trace(" - Start: " + start);
        Logger.trace(" - End: " + end);
        let startTimestamp: Number = start.getTime() / 1000;
        let endTimestamp: Number = end.getTime() / 1000;
        Logger.trace(" - startTimestamp: " + startTimestamp);
        Logger.trace(" - endTimestamp: " + endTimestamp);
        try {
            let response: AxiosResponse = await this.interface.get("/remote/v1/events", {
                params: {
                    direction: "range",
                    earliest_event_time: startTimestamp,
                    latest_event_time: endTimestamp,
                    num_events: 300
                }
            });
            if (typeof response.data.events == 'undefined') {
                console.error("no Response");
                return new EventList();
            }
            return EventList.parse(response.data.events);
        }
        catch (error:any) {  
            if (error?.response?.statusCode == 401)   {
                console.log("Auth Error");
            }  
            Logger.error("Failed to get Picture List.")    
            Logger.info(" - "+error?.response?.status+": "+error?.response?.statusText) ;
             throw (new RequestError(error?.response?.status,error?.response?.statusText,"Get Picture List."));
        }
    }


    public async getImageFile(attatchmentId: string, objKey: string, tracker: ImageTracker) {
        Logger.trace("Tadpoles.getImageFile");
        let response: AxiosResponse = await this.interface.get("/remote/v1/obj_attachment", {
            responseType: "stream",
            params: {
                obj: objKey,
                key: attatchmentId,
                download: "true"
            }
        });
        tracker.setInitType(MimeTypes.fromContentType(response.headers["content-type"]));
        return response.data;
    }

    responseJsonPrinter(response: AxiosResponse) {
        console.log("response Printer");
        // console.log(JSON.stringify(response));
        console.log(response.data.events)
    }

    responsePrinter(response: AxiosResponse) {
        console.log("response Printer");
        // console.log(JSON.stringify(response));
        console.log(response.status)
        try {
            fs.writeFileSync('./dump.html', response.data);
            //file written successfully
        } catch (err) {
            console.error(err)
        }

    }

}