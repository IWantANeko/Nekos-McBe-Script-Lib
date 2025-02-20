import { ScoreboardIdentity, ScoreboardObjective, system, world } from "@minecraft/server";
import { MemoryBuffer } from "../Utils/Buffer";

export const INTERVAL_DELAY = 0;
export const BATCH_SIZE = 75;

export class DatabaseStaticCache<T extends any | [any, any]> {
    private readonly id: string;

    public constructor(id: string) {
        if (id.length > 16) throw new Error(`ID too long (${id.length} > 16)`);
        this.id = id;
    }

    public async export(datas: T[]): Promise<void> {
        if (!Array.isArray(datas) || datas.length === 0) return;
        
        const buffer = new MemoryBuffer<T>(Infinity);
        buffer.add(datas);
    
        const storage = this.hasStorage()
            ? this.getStorage()!
            : this.addStorage();
    
        let index = 0;

        return new Promise<void>((resolve) => {
            const intervalId = system.runInterval(() => {
                const batch = buffer.get(BATCH_SIZE, true);
    
                for (const data of batch) {
                    storage.setScore(
                        JSON.stringify(data),
                        index++
                    );
                }

                if (buffer.isEmpty()) {
                    system.clearRun(intervalId);
                    resolve();
                }
            }, INTERVAL_DELAY);
        });
    }

    public async importAndGet(): Promise<T[]> {
        const storage = this.getStorage();
        if (storage === undefined) return [];

        const buffer = new MemoryBuffer<ScoreboardIdentity>(Infinity);
        buffer.add(storage.getParticipants());
        const fetchedDatas: T[] = [];

        await new Promise<void>(async (resolve) => {
            const intervalId = system.runInterval(() => {
                const participants = buffer.get(BATCH_SIZE, true);
    
                for (const participant of participants) {
                    if (participant.type !== "FakePlayer") continue;
                    fetchedDatas.push(JSON.parse(participant.displayName) as T);
                }

                if (buffer.isEmpty()) {
                    system.clearRun(intervalId);
                    resolve();
                }
            }, INTERVAL_DELAY);
        });

        return fetchedDatas;
    }

    // public async importAndSet(setter: (arg: T) => any): Promise<void> {
    //     const storage = this.getStorage();
    //     if (storage === undefined) return;

    //     const buffer = new MemoryBuffer<ScoreboardIdentity>(Infinity);
    //     buffer.add(storage.getParticipants());

    //     await new Promise<void>(async (resolve) => {
    //         const intervalId = system.runInterval(() => {
    //             const participants = buffer.get(30, true);
    
    //             for (const participant of participants) {
    //                 if (participant.type !== "FakePlayer") continue;
    //                 setter(JSON.parse(participant.displayName) as T);
    //             }

    //             if (buffer.isEmpty()) {
    //                 system.clearRun(intervalId);
    //                 resolve();
    //             }
    //         }, 5);
    //     });
    // }

    public getStorage(): ScoreboardObjective | undefined {
        return world.scoreboard.getObjective(this.id);
    }

    public addStorage(): ScoreboardObjective | never {
        return world.scoreboard.addObjective(this.id, "DO NOT DELETE");
    }

    public hasStorage(): boolean {
        return world.scoreboard.getObjective(this.id) !== undefined;
    }

    public removeStorage(): void {
        world.scoreboard.removeObjective(this.id);
    }

    public get storageSize(): number {
        const storage = this.getStorage();
        return storage !== undefined
            ? storage.getParticipants().length
            : 0;
    }
}