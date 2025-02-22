import { world } from "@minecraft/server";

const {
    setDynamicProperty: setLocal,
    getDynamicProperty: getLocal
} = world;

export class LogDatabase {
    public readonly id: string;
    public readonly maxLogs: number;

    constructor(id: string, maxLogs: number = 500) {
        this.id = id;
        this.maxLogs = maxLogs;
    }

    public get logsAmount(): number {
        const rawLogString = this.getLocalLogString();
        return rawLogString.split('\u241E').length - 1;
    }

    public pushLogs(...logs: string[]): void {
        const rawLogString = this.getLocalLogString();
        const existingLogs = rawLogString ? rawLogString.split('\u241E') : [];
        existingLogs.push(...logs);
    
        if (existingLogs.length > this.maxLogs) {
            const excess = existingLogs.length - this.maxLogs;
            existingLogs.splice(0, excess);
        }
    
        this.setLocalLogString(existingLogs.join('\u241E'));
    }

    public getLatestLog(): string | undefined {
        const logs = this.getLogs();
        return logs.length > 0 ? logs[logs.length - 1] : undefined;
    }

    public getFirstLog(): string | undefined {
        const logs = this.getLogs();
        return logs.length > 0 ? logs[0] : undefined;
    }

    public getLogs(): string[] {
        const logString = this.getLocalLogString();
        return logString.split('\u241E');
    }

    public clearLogs(): void {
        this.setLocalLogString("");
    }

    private setLocalLogString(logString: string): void {
        setLocal(`LOG_DATABASE:${this.id}`, logString);
    }

    private getLocalLogString(): string {
        return getLocal(`LOG_DATABASE:${this.id}`) as string || "";
    }
}