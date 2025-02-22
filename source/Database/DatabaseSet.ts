import { system, world } from "@minecraft/server";

/**
 * A database set is a collection of values that can be stored in the database
 * @template T The type of the values in the database set
 */
export class DatabaseSet<T> {
    public readonly id: string;
    public readonly autoUpdate: boolean;
    public readonly chunkSize: number = 10000;

    private _values: Set<T>;
    private _isUpdating: boolean = false;

    /**
     * Create a new database set
     * @param id the id of the database set
     * @param autoUpdate if enabled, the database set will automatically update when a change is made
     * @param onFetch callback that will be called when the database set is fetched
     */
    constructor(id: string, autoUpdate: boolean = true, onFetch?: () => void) {
        this.id = id;
        this.autoUpdate = autoUpdate;
        this._values = new Set();

        const callback = () => {
            this.fetchDatas();
            if (onFetch) onFetch();
        }

        system.run(callback);
    }

    /** Get the size of the database set */
    public get size(): number { return this._values.size; }

    /** Check if the database set is empty */
    public get isEmpty(): boolean { return this._values.size === 0; }

    /** Get the number of chunks */
    public get chunks(): number { return Math.ceil(this._values.size / this.chunkSize); }

    /** Get if the database set is updating */
    public get isUpdating(): boolean { return this._isUpdating; }

    /** Fetches the data from the database */
    public fetchDatas(): void {
        let string = "";
        let index = 0;

        while (true) {
            const chunkString = world.getDynamicProperty(`dbs:${this.id}:chunk:${index}`);
            if (chunkString === undefined) break;

            if (typeof chunkString !== "string") {
                world.setDynamicProperty(`dbs:${this.id}:chunk:${index}`, "");
                continue;
            }

            string += chunkString;
            index++;
        }

        try {
            this._values = new Set(JSON.parse(string));
        } catch (e) {
            console.error(`Error while fetching data: ${e}`);
            this.removeOldChunks();
        }
    }

    /** Chunk values into smaller strings */
    private chunkValues(values: T[]): string[] {
        const chunkStrings: string[] = [];
        const valueString = JSON.stringify(values);
        const stringLength = valueString.length;

        // Split the string into chunks of defined size
        for (let i = 0; i < stringLength; i += this.chunkSize) {
            chunkStrings.push(valueString.slice(i, i + this.chunkSize));
        }

        return chunkStrings;
    }

    /**
     * Remove old chunks from the database
     * @returns {number} the amount of chunks removed
     */
    private removeOldChunks(): number {
        let index = 0;

        while (world.getDynamicProperty(`dbs:${this.id}:chunk:${index}`)) {
            world.setDynamicProperty(`dbs:${this.id}:chunk:${index}`, "");
            index++;
        }

        return index;
    }

    /**
     * Update the database set
     * @remarks not required to use when autoUpdate is enabled
     */
    public update(): void {
        const chunks = this.chunkValues(Array.from(this._values));
        this.removeOldChunks();

        for (let index = 0; index < chunks.length; index++) {
            world.setDynamicProperty(`dbs:${this.id}:chunk:${index}`, chunks[index]);
        }
    }

    /** If autoUpdate is enabled, the database set will automatically update when a change is made */
    private onChanges(): void {
        if (this.autoUpdate && !this._isUpdating) {
            this._isUpdating = true;

            system.run(() => {
                this.update();
                this._isUpdating = false;
            });
        }
    }

    /** Add a value to the database set */
    public add(value: T): this {
        if (!this._values.has(value)) {
            this._values.add(value);
            this.onChanges();
        }

        return this;
    }

    /** Get the first and last value */
    public getFirstItem(): T | undefined { return this.values()[0]; }

    /** Get the first and last value */
    public getLastItem(): T | undefined { return this.values()[this.size - 1]; }

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
     * Delete the first value from the database set
     */
    public deleteFirstItem(): boolean {
        const deleted = this._values.delete(this.values()[0]);
        if (deleted) this.onChanges();
        return deleted;
    }

    /**
     * Delete the last value from the database set
     */
    public deleteLastItem(): boolean {
        const deleted = this._values.delete(this.values()[this.size- 1]);
        if (deleted) this.onChanges();
        return deleted;
    }

    /**
     * Clear the database set
     * @returns {boolean} Returns true if the database set was cleared
     */
    public clear(): void {
        if (this._values.size > 0) {
            this._values.clear();
            this.onChanges();
        }
    }

    /**
     * Execute a function for each value in the database set
     */
    public forEach(callbackfn: (value: T, instance: DatabaseSet<T>) => void): void {
        this._values.forEach((value) => callbackfn(value, this));
        this.onChanges();
    }

    /** Get the values of the database set */
    public values(): T[] {
        return Array.from(this._values);
    }
}