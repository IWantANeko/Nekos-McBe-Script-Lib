import { system, world } from "@minecraft/server";

/**
 * A database set is a collection of values that can be stored in the database
 * @template T The type of the values in the database set
 */
export class DatabaseSet<T> {
    public readonly id: string;
    public readonly autoUpdate: boolean;

    private _values: Set<T>;
    private _updatePid: number | null = null;

    /**
     * Create a new database set
     * @param id the id of the database set
     * @param autoUpdate if enabled, the database set will automatically update when a change is made
     */
    constructor(id: string, autoUpdate: boolean = true) {
        this.id = id;
        this.autoUpdate = autoUpdate;
        this._values = new Set(this.fetchDatas());
    }

    /** Get the size of the database set */
    public get size(): number {return this._values.size; } 

    /** Check if the database set is empty */
    public get isEmpty(): boolean { return this._values.size === 0; }

    /** fetches the datas from the database */
    private fetchDatas(): T[] {
        const data = world.getDynamicProperty(`dbs:${this.id}`);
        if (data === undefined) return [];
        
        if (typeof data !== "string") {
            world.setDynamicProperty(`dbs:${this.id}`);
            return [];
        }

        return JSON.parse(data);
    }

    /** If autoUpdate is enabled, the database set will automatically update when a change is made */
    private onChanges(): void {
        if (this.autoUpdate && this._updatePid === null) {
            const callback = () => {
                this.update();
                this._updatePid = null;
            }

            this._updatePid = system.run(callback);
        }
    }

    /** Add a value to the database set */
    public add(value: T): this {
        if (this._values.has(value)) {
            this._values.add(value);
            this.onChanges();
        }

        return this;
    }

    /**
     * Check if the database set has a value
     * @returns {boolean} Returns true if the database set has the value
     */
    public has(value: T): boolean {
        return this._values.has(value);
    }

    /**
     * Delete a value from the database set
     * @param {T} value The value to delete
     */
    public delete(value: T): boolean {
        const deleted = this._values.delete(value);
        if (deleted) this.onChanges();
        return deleted;
    }

    /**
     * Clear the database set
     * @returns {boolean} Returns true if the database set was cleared
     */
    public clear(): void {
        if (this._values.size === 0) return;
        this._values.clear();
        this.onChanges();
    }

    /**
     * Execute a function for each value in the database set
     */
    public forEach(callbackfn: (value: T, instance: DatabaseSet<T>) => void): void {
        this._values.forEach((value) => callbackfn(value, this));
        this.onChanges();
    }

    /**
     * Update the database set
     * @remarks not required to use when autoUpdate is enabled
     */
    public update(): void {
        world.setDynamicProperty(
            `dbs:${this.id}`,
            JSON.stringify(Array.from(this._values))
        );
    }

    /** Get the values of the database set */
    public values(): T[] {
        return Array.from(this._values);
    }
}