import {
    ScriptEventCommandMessageAfterEvent as ScriptEvent,
    system
} from "@minecraft/server";

///////////////////////////////////////////////////////////////
//! TYPES

export enum DefaultStatusCodes {
    NONE = "none",
    DEFERRED = "deferred",

    SERVICE_UNAVAILABLE = "service_unavailable",
    SERVICE_CLOSED = "service_closed",

    TIMEOUT = "timeout"
}

export type PackageName = string;
export type DestinationPackageName = string | "*";
export type DataPackId = string;
export type PackageServiceId = string;
export type Content = any;

export type PackageServiceCallbackFn = (Request: Request) => void;
export type ScriptEvenCallbackFn = (arg: ScriptEvent) => void;

export type StringRequest = string;
export type StringResponse = string;
export type DataTypes = "request" | "response";
export type ResponseStatusTypes = "success" | "error" | "timeout" | "deferred";
export type ResponseStatusCode = string;

export interface AwaitingRequest {
    pid?: number;
    resolve: (value: Response) => void;
}

///////////////////////////////////////////////////////////////
//! SETTINGS

export class PackageSettings {
    public static readonly packageName = "test";
    public static readonly timeout = 200;
}

///////////////////////////////////////////////////////////////
//! RESPONSE HANDLER

export class ResponseHandler {
    public static handleDeferredResponse(awaitingRequest: AwaitingRequest): void {
        const pid = awaitingRequest.pid;
        if (!pid) return;
        system.clearRun(pid);
        delete awaitingRequest.pid;
    }

    public static handleRegularResponse(awaitingRequest: AwaitingRequest, response: Response): void {
        const { resolve, pid } = awaitingRequest;
        resolve(response);
        if (pid) system.clearRun(pid);
    }
}

///////////////////////////////////////////////////////////////
//! DataPacker

export class DataPacker {
    public static packId(dataType: DataTypes, sourcePackage: PackageName, destinationPackage: DestinationPackageName): DataPackId {
        return `${dataType}>${sourcePackage}>${destinationPackage}`;
    }

    public static unpackId(string: DataPackId): [DataTypes, PackageName, DestinationPackageName] | null {
        try {
            const datas = string.split(">");
            if (datas.length !== 3) return null;

            return [
                datas[0] as DataTypes,
                datas[1] as PackageName,
                datas[2] as DestinationPackageName
            ];
        } catch (error) {
            console.error(`Error while unpacking id: ${error}`);
            return null;
        }
    }

    public static unpackRequest(string: StringRequest): Request | null {
        try {
            const datas = JSON.parse(string);

            return new Request(
                datas.destinationPackage as PackageName,
                datas.sourcePackage as PackageName,
                datas.service as PackageServiceId,
                datas.packageContent as Content
            );
        } catch (error) { 
            console.error(`Error while unpacking request: ${error}`);
            return null;
        }
    }

    public static unpackResponse(request: StringResponse): Response | null {
        try {
            const datas = JSON.parse(request);
            return new Response(
                datas.destinationPackage as PackageName,
                datas.sourcePackage as PackageName,
                datas.packageContent as Content,
                datas.status as ResponseStatusTypes,
                datas.statusCode as ResponseStatusCode,
                datas.requestId as string,
                datas.errorMessage as string
            );
        } catch (error) {
            console.error(`Error while unpacking response: ${error}`);
            return null;
        }
    }

    public static packRequest(request: Request): StringRequest {
        return JSON.stringify(
            {
                destinationPackage: request.destinationPackage,
                sourcePackage: request.sourcePackage,
                packageContent: request.packageContent,
                requestId: request.requestId
            }
        );
    }

    public static packResponse(response: Response): StringResponse {
        return JSON.stringify(
            {
                destinationPackage: response.destinationPackage,
                sourcePackage: response.sourcePackage,
                packageContent: response.packageContent,
                status: response.status,
                requestId: response.requestId,
                errorMessage: response.errorMessage
            }
        );
    }

    public static generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
            const random = (Math.random() * 16) | 0;
            const value = char === 'x' ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    }
}

///////////////////////////////////////////////////////////////
//! DATA STRUCTURES

export abstract class Data {
    public readonly requestId: string;
    public readonly packageContent: Content;
    public readonly sourcePackage: PackageName;
    public readonly destinationPackage: DestinationPackageName;

    public constructor(
        destinationPackage: DestinationPackageName,
        sourcePackage: PackageName,
        packageContent: Content,
        requestId?: string
    ) {
        this.packageContent = packageContent;
        this.sourcePackage = sourcePackage;
        this.destinationPackage = destinationPackage;
        this.requestId = requestId || DataPacker.generateUUID();
    }
}

export class Response extends Data {
    public readonly status: ResponseStatusTypes;
    public readonly statusCode: ResponseStatusCode;
    public readonly errorMessage?: string;
    
    public constructor(
        destinationPackage: DestinationPackageName,
        sourcePackage: PackageName,
        packageContent: Content,
        status: ResponseStatusTypes,
        statusCode: ResponseStatusCode,
        requestId: string,
        errorMessage?: string
    ) {
        super(destinationPackage, sourcePackage, packageContent, requestId);
        this.status = status;
        this.statusCode = statusCode;
        this.errorMessage = errorMessage;
    }
}

export class Request extends Data {
    public readonly service: PackageServiceId;

    public constructor(
        destinationPackage: DestinationPackageName,
        sourcePackage: PackageName,
        service: PackageServiceId,
        packageContent: Content,
        requestId?: string
    ) {
        super(destinationPackage, sourcePackage, packageContent, requestId);
        this.service = service;
    }

    public toResponse(packageContent: Content | "", status: ResponseStatusTypes, statusCode: ResponseStatusCode, errorMessage?: string): Response {
        return new Response(
            this.destinationPackage,
            this.sourcePackage,
            packageContent,
            status,
            statusCode,
            this.requestId,
            errorMessage,
        );
    }

    public respond(packageContent: Content | "", status: ResponseStatusTypes, statusCode: ResponseStatusCode): void {
        const response = this.toResponse(packageContent, status, statusCode);
        Package.instance.respondDataObject(response);
    }

    public deferReply(): void {
        const response = this.toResponse("", "deferred", DefaultStatusCodes.DEFERRED);
        Package.instance.respondDataObject(response);
    }
}

///////////////////////////////////////////////////////////////
//! ERROR

class PackageFeedback extends Error {
    public static log(message: string): void {
        console.log(`§6[Package Info] ${message}`);
    }

    public static warn(message: string): void {
        console.warn(`§6[Package Warning] ${message}`);
    }

    public static error(message: string): void {
        console.error(`§6[Package Error] ${message}`);
    }
}

///////////////////////////////////////////////////////////////
//! SYSTEM EVENT HANDLER

class PackageSystemEventHandler {
    protected eventCallback: ScriptEvenCallbackFn | undefined;

    public constructor(callback: ScriptEvenCallbackFn) {
        this.register(callback);
    }

    public register(callback: ScriptEvenCallbackFn): void {
        if (this.eventCallback) return;

        this.eventCallback = system.afterEvents.scriptEventReceive.subscribe(callback.bind(this));
    }

    public unregister(): void {
        if (!this.eventCallback) return;

        system.afterEvents.scriptEventReceive.unsubscribe(this.eventCallback);
        this.eventCallback = undefined;
    }

    public isRegistered(): boolean {
        return this.eventCallback !== undefined;
    }
}

///////////////////////////////////////////////////////////////
//! SERVICE

class PackageService {
    public readonly name: PackageServiceId;
    public readonly services: PackageServiceCallbackFn[] = [];
    protected _isClosed: boolean = false;

    public constructor(
        name: PackageServiceId,
        services: PackageServiceCallbackFn[]
    ) {
        this.name = name;
        this.services = services;
    }

    public get isClosed(): boolean { return this._isClosed; }

    public addCallback(callback: PackageServiceCallbackFn): PackageService {
        this.services.push(callback);
        return this;
    }

    public open(): PackageService {
        if (this._isClosed) this._isClosed = false;
        return this;
    }

    public close(): PackageService {
        if (!this._isClosed) this._isClosed = true;
        return this;
    }
}

abstract class PackageServiceHandler {
    protected static services: Map<PackageServiceId, PackageService>;

    public addService(serviceId: PackageServiceId, callback: PackageServiceCallbackFn): Package {
        if (Package.services.has(serviceId)) {
            Package.services.get(serviceId)?.addCallback(callback);
        } else {
            Package.services.set(serviceId, new PackageService(serviceId, [callback]));
        }

        return this as unknown as Package;
    }

    public removeService(serviceId: PackageServiceId): boolean {
        if (Package.services.has(serviceId)) {
            Package.services.delete(serviceId);
            return true;
        }

        return false;
    }

    public closeService(serviceId: PackageServiceId): Package {
        if (Package.services.has(serviceId)) {
            Package.services.get(serviceId)!.close();
        }

        return this as unknown as Package;
    }

    public openService(serviceId: PackageServiceId): Package {
        if (Package.services.has(serviceId)) {
            Package.services.get(serviceId)!.open();
        }

        return this as unknown as Package;
    }

    public hasService(service: PackageServiceId): boolean {
        return Package.services.has(service);
    }

    public isServiceAvailable(service: PackageServiceId): boolean | null {
        return Package.services.has(service)
            ? !Package.services.get(service)!.isClosed
            : null;
    }
}

///////////////////////////////////////////////////////////////
//! PACKAGE

class Package extends PackageServiceHandler {
    public static instance: Package;
    public static readonly packageName: PackageName = PackageSettings.packageName;

    private static systemEventHandler: PackageSystemEventHandler;
    private static awaitingRequests: Map<string, AwaitingRequest>;

    public constructor() {
        if (Package.instance) {
            return Package.instance;
        }

        super();        
        Package.services = new Map<PackageServiceId, PackageService>();
        Package.systemEventHandler = new PackageSystemEventHandler(this.scriptEventHandler.bind(this));
        Package.awaitingRequests = new Map();
        Package.instance = this;
    }

    public get serviceState(): boolean {
        return Package.systemEventHandler.isRegistered();
    }

    public disableService(): void {
        if (!Package.systemEventHandler.isRegistered()) return;
        Package.systemEventHandler.unregister();
    }

    public enableService(): void {
        if (Package.systemEventHandler.isRegistered()) return;
        Package.systemEventHandler.register(this.scriptEventHandler.bind(this));
    }

    public respond(
        destinationPackage: DestinationPackageName,
        packageContent: Content,
        status: ResponseStatusTypes,
        statusCode: ResponseStatusCode,
        requestId: string,
        errorMessage?: string,
        customSourcePackage?: PackageName
    ): void {
        const response = new Response(
            destinationPackage,
            customSourcePackage || Package.packageName,
            packageContent,
            status,
            statusCode,
            requestId,
            errorMessage
        );

        this.respondDataObject(response);
    }

    public respondDataObject(response: Response): void {
        // system.sendScriptEvent(
        //     DataPacker.packId("response", sourcePackage, destinationPackage),
        //     DataPacker.packResponse(response)
        // );
    }

    public async send(
        destinationPackage: DestinationPackageName,
        serviceId: PackageServiceId,
        packageContent: Content,
        customRequestId?: string,
        customSourcePackage?: PackageName,
    ): Promise<Response> {
        const request = new Request(
            destinationPackage,
            customSourcePackage || Package.packageName,
            serviceId,
            packageContent,
            customRequestId || DataPacker.generateUUID()
        );

        return this.sendDataObject(request);
    }

    public async sendDataObject(request: Request): Promise<Response> {
        // system.sendScriptEvent(
        //     DataPacker.packId("request", request.sourcePackage, request.destinationPackage),
        //     DataPacker.packRequest(request)
        // );

        const data = await this.waitForResponse(request.destinationPackage, request.requestId);
        return data;
    }

    private scriptEventHandler(scriptEvent: ScriptEvent): void {
        if (scriptEvent.sourceType !== "Server") return;

        const [dataType, sourceName, destinationName] = DataPacker.unpackId(scriptEvent.id) || [null, null];

        if (destinationName === null) {
            PackageFeedback.error(`Failed to unpack id: ${scriptEvent.id}`);
            return;
        }

        if (
            (destinationName === "*" && sourceName === Package.packageName) ||
            (destinationName !== Package.packageName)
        ) return;

        switch (dataType) {
            case "request": {
                const request = DataPacker.unpackRequest(scriptEvent.message);

                if (!request) {
                    PackageFeedback.error(`Failed to unpack request: ${scriptEvent.message}`);
                    return;
                }
                    
                this.handleRequest(request);
                break;
            }

            case "response": {
                const response = DataPacker.unpackResponse(scriptEvent.message);

                if (!response) {
                    PackageFeedback.error(`Failed to unpack response: ${scriptEvent.message}`);
                    return;
                }
    
                this.handleResponse(response);
                break;
            }

            default: {
                PackageFeedback.error(`Failed to unpack data: ${scriptEvent.message}`);
                PackageFeedback.log(`Unknown data type: ${dataType} (typeof=${typeof dataType})`);
                break;
            }
        }
    }
    
    private handleResponse(response: Response): void {
        const requestId = response.requestId;
    
        if (Package.awaitingRequests.has(requestId)) {
            const awaitingRequest = Package.awaitingRequests.get(requestId)!;
    
            if (response.status === "deferred") {
                ResponseHandler.handleDeferredResponse(awaitingRequest);
                return;
            }
            
            ResponseHandler.handleRegularResponse(awaitingRequest, response);
    
            Package.awaitingRequests.delete(requestId);
        } else {
            PackageFeedback.error(`Received response for unknown request: ${requestId}`);
        }
    }    

    private handleRequest(request: Request): void {
        const serviceId = request.service;
        let response: Response | undefined;

        if (Package.services.has(serviceId)) {
            const service = Package.services.get(serviceId)!;

            if (!service.isClosed) {
                for (const callback of service.services) {
                    callback(request);
                } return;
            }
            
            response = request.toResponse("", "error", DefaultStatusCodes.SERVICE_CLOSED, "Service is closed");
        } else {
            response = request.toResponse("", "error", DefaultStatusCodes.SERVICE_UNAVAILABLE, "Service not found");
        }

        this.respondDataObject(response);
    }

    private waitForResponse(destinationPackage: PackageName, requestId: string): Promise<Response> {
        return new Promise((resolve) => {
            const pid = system.runTimeout(() => {
                resolve(new Response(
                    destinationPackage,
                    Package.packageName,
                    "",
                    "timeout",
                    DefaultStatusCodes.TIMEOUT,
                    requestId,
                    "Request timed out"
                ));

                Package.awaitingRequests.delete(requestId);
            }, PackageSettings.timeout);

            Package.awaitingRequests.set(requestId, { resolve, pid });
        });
    }
}

const thisPackage = new Package();

export {
    Package,
    thisPackage
};