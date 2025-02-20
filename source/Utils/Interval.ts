import { system } from "@minecraft/server";

export class Interval {
    private static _intervals: Map<number, Interval> = new Map<number, Interval>();

    public readonly callback: () => void = () => {};
    public readonly tickDelay: number = 1;
    private _id: number = NaN;

    public constructor(callback: () => void, tickDelay: number = 1) {
        this.callback = callback;
        this.tickDelay = tickDelay;
    }

    public get id(): number {
        return this._id;
    }

    public get isActive(): boolean {
        return Interval._intervals.has(this._id);
    }

    public static get(id: number): Interval | null {
        return Interval._intervals.get(id) || null;
    }

    public static has(id: number): boolean {
        return Interval._intervals.has(id);
    }

    public start(): boolean {
        if (Interval._intervals.has(this._id)) return false;

        this._id = system.runInterval(this.callback, this.tickDelay);
        Interval._intervals.set(this._id, this);
        return true;
    }

    public stop(): boolean {
        if (!Interval._intervals.has(this._id)) return false;

        system.clearRun(this._id);
        Interval._intervals.delete(this._id);
        return true;
    }
}