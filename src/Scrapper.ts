import Tadpoles from './tadpoles.js';
import Logger from './Logger.js';
import * as fs from 'fs';
import EventList from './models/EventList.js';
import Jimp from 'jimp';
import { EventTypes } from './models/Event.js';
import { ExifTool } from 'exiftool-vendored';
import DoDate from './DoDate.js';
import OutputHandler from './OutputHandler.js';
import ImageTracker from './ImageTracker.js';
import { MimeTypes, SplitType } from './Enums.js';
import { fileTypeFromFile } from 'file-type';
import RequestError from './models/RequestError.js';

export default class Scrapper {
    readonly authString: string;
    readonly outputDir: string;
    readonly website: Tadpoles;
    readonly outputHandler: OutputHandler;
    static readonly exifTool: ExifTool = new ExifTool();

    constructor(authString: string, outputDir: string, split: SplitType) {
        this.authString = authString;
        this.outputDir = outputDir;
        this.website = new Tadpoles();
        this.outputHandler = new OutputHandler(outputDir, split);
    }

    public async run(start: DoDate, end: DoDate) {
        try {
            Logger.trace('Scrapper.run');
            Logger.trace(' - AuthString: ' + this.authString);
            Logger.trace(' - OutputDir: ' + this.outputDir);
            Logger.trace(' - Start Date: ' + start.detatch());
            Logger.trace(' - End Date: ' + end.detatch());

            let curStart: DoDate = start.clone();

            //Scrape by month
            while (curStart.getTime() < end.getTime()) {
                let curEnd: DoDate = curStart.clone();
                curEnd.incMonth();
                Logger.log(
                    'Processing photos from ' +
                        curStart.toDateString() +
                        ' to ' +
                        curEnd.toDateString()
                );
                this.website.login(this.authString);
                let eventList: EventList = await this.website.getPictureIndex(
                    curStart.detatch(),
                    curEnd.detatch()
                );
                let trackerList: ImageTracker[] = await this.processEvents(
                    eventList
                );
                await this.processTrackerFiles(trackerList);
                curStart = curEnd.clone();
            }
        } catch (error: any) {
            switch (error.status) {
                case 401: {
                    Logger.log(
                        'Unable to log into Tadpoles using authKey: ' +
                            this.authString
                    );
                }
            }
            Logger.error(error);
        } finally {
            Logger.trace('Scrapper.run.finally');
            Scrapper.exifTool.end();
        }
    }

    async processTrackerFiles(trackerList: ImageTracker[]) {
        Logger.trace('Scrapper.processTrackerFiles');
        Logger.log('Processing Tracker File Group');
        await Promise.all(
            trackerList.map(async (tracker) => {
                Logger.trace(' - ' + tracker.getInitFile());
                await this.validateOriginal(tracker);
                await this.convert2Format(tracker);
                await this.updateMetadata(tracker);
            })
        );
    }

    async validateOriginal(tracker: ImageTracker) {
        Logger.trace('Scrapper.validateOriginal: ' + tracker.getInitFile());
        let curType = await fileTypeFromFile(tracker.getInitFile());
        let curMime = MimeTypes.fromContentType(curType?.mime);
        Logger.debug(
            'Tracker Mime: ' +
                tracker.getInitType().getContentType() +
                ' File Mime: ' +
                curMime.getContentType()
        );
        if (curMime == tracker.getInitType()) return;
        tracker.setInitType(curMime);
        let newPath = this.outputHandler.getPathFromMime(
            curMime,
            tracker.getCreateDate(),
            tracker.getAttatchment()
        );

        Logger.debug(
            'File must be moved: ' + tracker.getInitFile() + ' -> ' + newPath
        );
        fs.renameSync(tracker.getInitFile(), newPath);
        tracker.setInitFile(newPath);
    }

    async updateMetadata(tracker: ImageTracker) {
        Logger.trace('Scrapper.updateMetadata: ' + tracker.getInitFile());
        for (const file of tracker.getFileIterator()) {
            try {
                await Scrapper.exifTool.write(file, {
                    //Time
                    AllDates: tracker.getIsoCreateDate(),
                    CreationDate: tracker.getIsoCreateDate(),
                    CreateDate: tracker.getIsoCreateDate(),
                    MetadataDate: tracker.getIsoCreateDate(),
                    ModifyDate: tracker.getIsoCreateDate(),
                    DateCreated: tracker.getIsoCreateDate(),
                    //Comment
                    UserComment: tracker.getComment(),
                    Headline: tracker.getComment(),
                    'XMP:Headline': tracker.getComment(),
                    'Caption-Abstract': tracker.getComment(),
                    Title: tracker.getComment(),
                    ObjectName: tracker.getComment(),
                    // Description
                    Description: tracker.getDescription(),
                    ImageDescription: tracker.getDescription(),
                    XPComment: tracker.getDescription(),
                    //Location
                    'XMP:City': tracker.getCity(),
                    City: tracker.getCity(),
                    'Sub-location': tracker.getSubLocation(),
                    Location: tracker.getSubLocation(),
                    State: tracker.getState(),
                    'Province-State': tracker.getState(),
                    'Country-PrimaryLocationCode': tracker.getCountryCode(),
                    ContentLocationCode: tracker.getCountryCode(),
                    CountryCode: tracker.getCountryCode(),
                    Country: tracker.getCountryName(),
                    ContentLocationName: tracker.getCountryName(),
                    'Country-PrimaryLocationName': tracker.getCountryName(),
                    //Picture Taker
                    Artist: tracker.getCameraMan(),
                    Creator: tracker.getCameraMan(),
                    'Writer-Editor': tracker.getCameraMan(),
                    //Tags
                    Keywords: tracker.getKeywords(),
                    'XMP:Keywords': tracker.getKeywords(),
                    //People
                    People: tracker.getSubjects()
                });
                Logger.statusTick();
            } catch (error) {
                Logger.error('Failed to add metadata to: ' + file);
                Logger.error(error);
            }
        }
    }

    async processEvents(eventList: EventList) {
        Logger.trace('Scrapper.processEvents');
        let output: ImageTracker[] = [];
        await Promise.all(
            eventList.events.map(async (event) => {
                Logger.trace('Processing Event');
                Logger.trace(' - ' + event.type);
                if (event.type !== EventTypes.ACTIVITY) {
                    Logger.debug(' - Discarding Event.');
                    return;
                }
                let i: number = 0;
                if (event.attachments !== null)
                    await Promise.all(
                        event.attachments.map(async (attachment) => {
                            let tracker: ImageTracker = new ImageTracker(
                                event,
                                i++
                            );
                            output.push(tracker);
                            await this.dlOrigImg(
                                await this.website.getImageFile(
                                    attachment,
                                    event.key,
                                    tracker
                                ),
                                tracker
                            );
                        })
                    );
            })
        );
        return output;
    }

    async dlOrigImg(fileData: any, tracker: ImageTracker) {
        Logger.trace('Scrapper.dlOrigImg');
        try {
            if (!tracker.isValid()) {
                Logger.error(' - tracker is not valid');
                return;
            }
            tracker.setInitFile(
                this.outputHandler.getPathFromMime(
                    tracker.getInitType(),
                    tracker.getCreateDate(),
                    tracker.getAttatchment()
                )
            );
            let w = await fileData.pipe(
                fs.createWriteStream(tracker.getInitFile())
            );
            let done: boolean = false;
            w.on('finish', async () => {
                done = true;
                Logger.log(
                    'Successfuly Downloaded image to: ' + tracker.getInitFile()
                );
            });
            while (!done) {
                await new Promise((vars) => setTimeout(vars, 100));
            }
        } catch (err) {
            console.error(err);
        }
    }

    async convert2Format(tracker: ImageTracker) {
        Logger.trace('Scrapper.convert2Jpg');

        try {
            switch (tracker.getInitType()) {
                case MimeTypes.PNG: {
                    let image = await Jimp.read(tracker.getInitFile());
                    let file = tracker.addFile(
                        MimeTypes.JPG,
                        this.outputHandler.getPathFromMime(
                            MimeTypes.JPG,
                            tracker.getCreateDate(),
                            tracker.getAttatchment()
                        )
                    );
                    image.write(file);
                    Logger.info(
                        'Converted ' +
                            tracker.getInitFile() +
                            ' to JPG and saved to: ' +
                            file
                    );
                    Logger.statusTick();
                }
                case MimeTypes.JPG: {
                    let image = await Jimp.read(tracker.getInitFile());
                    let file = tracker.addFile(
                        MimeTypes.PNG,
                        this.outputHandler.getPathFromMime(
                            MimeTypes.PNG,
                            tracker.getCreateDate(),
                            tracker.getAttatchment()
                        )
                    );
                    image.write(file);
                    Logger.info(
                        'Converted ' +
                            tracker.getInitFile() +
                            ' to PNG and saved to: ' +
                            file
                    );
                    Logger.statusTick();
                }
            }
        } catch (error) {
            Logger.error('Problem converting ' + tracker.getInitFile());
            console.log(error);
        }
    }
}
