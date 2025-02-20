import { system, world } from "@minecraft/server";
import { DatabaseMap } from "./DatabaseMap.js";

export class DatabaseMapManager {
    private dataBases = new Map<string, DatabaseMap<any, any>>();

    public constructor(...dataBases: DatabaseMap<any, any>[]) {
        const propertyIds: Set<string> = new Set<string>(world.getDynamicPropertyIds()),
            thisBound: this = this;

        system.runJob((function *() {
            for (const database of dataBases) {
                thisBound.dataBases.set(database.id, database);
                const searchId: string = database.searchId,
                searchIdSubstringIndex: number = searchId.length + 1;
                
                for (const propertyId of propertyIds) {
                    if (!(propertyId.startsWith(searchId))) continue;

                    propertyIds.delete(propertyId);
    
                    database.initializeValue(
                        propertyId.substring(searchIdSubstringIndex),
                        world.getDynamicProperty(propertyId)
                    );
                }
            }
        })());
    }

    public get(id: string): DatabaseMap<any, any> | undefined {
        return this.dataBases.get(id);
    }

    public has(id: string): boolean {
        return this.dataBases.has(id);
    }

    public remove(id: string): boolean {
        return this.dataBases.delete(id);
    }

    public getAll(): DatabaseMap<any, any>[] {
        return Array.from(this.dataBases.values());
    }

    public removeAll(): void {
        this.dataBases.clear();
    }

    public get size(): number {
        return this.dataBases.size;
    }
}