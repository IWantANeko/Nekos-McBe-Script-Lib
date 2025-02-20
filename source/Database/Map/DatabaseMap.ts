import { Vector3, world } from "@minecraft/server";

export type dynamicPropertyValue = boolean | number | string | Vector3 | undefined;

export abstract class DatabaseMap<K, V> {
    protected readonly databaseValues: Map<K, V> = new Map<K, V>();
    abstract searchId: string;
    abstract id: string;

    public initializeValue(key: K, value: dynamicPropertyValue): void {
        this.databaseValues.set(key, value as V);
    }

    public get size(): number {
        return this.databaseValues.size;
    }

    public get(key: K): V | undefined {
        return this.databaseValues.get(key);
    }

    public has(key: K): boolean {
        return this.databaseValues.has(key);
    }

    public set(key: K, value: V, once: boolean = false): void {
        if (once && this.has(key)) return;

        this.setInternal(`${key}`, value as dynamicPropertyValue);
        this.databaseValues.set(key, value);
    }

    public delete(key: K): boolean {
        if (!(this.databaseValues.has(key))) return false;

        this.setInternal(`${key}`);
        this.databaseValues.delete(key);
        return true;
    }

    public clear(): void {
        for (const key of this.databaseValues.keys()) {
            this.setInternal(`${key}`);
        }

        this.databaseValues.clear();
    }

    public entries(): IterableIterator<[K, V]> { return this.databaseValues.entries(); }
    public keys(): IterableIterator<K> { return this.databaseValues.keys(); }
    public values(): IterableIterator<V> { return this.databaseValues.values(); }
    public getBundle(): [K, V][] { return [...this.databaseValues.entries()]; }

    public setInternal(key: string, value?: dynamicPropertyValue): void {
        world.setDynamicProperty(`${this.searchId}:${key}`, value);
    }
}