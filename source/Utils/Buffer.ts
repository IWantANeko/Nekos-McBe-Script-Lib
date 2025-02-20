export class MemoryBuffer<T> {
    private buffer: T[] = [];
    public readonly maxSize: number;

    constructor(maxSize: number) {
        if (maxSize <= 0) throw new Error("maxSize must be greater than 0");
        this.maxSize = maxSize;
    }

    public get length(): number {
        return this.buffer.length;
    }

    public isEmpty(): boolean {
        return this.buffer.length === 0;
    }

    public isFull(): boolean {
        return this.buffer.length >= this.maxSize;
    }

    public add(datas: T[]): void {
        const inTotal = datas.length + this.buffer.length;

        if (inTotal > this.maxSize) {
            this.buffer.splice(0, inTotal - this.maxSize);
        }

        this.buffer.push(...datas);
    }

    public getBuffer(): T[] {
        return [...this.buffer];
    }

    public get(amount: number = Infinity, remove: boolean = false): T[] {
        amount = Math.min(amount, this.buffer.length);
        return remove ? this.buffer.splice(0, amount) : this.buffer.slice(0, amount);
    }

    public getFirst(remove: boolean = false): T | undefined {
        return this.buffer.length === 0 ? undefined : remove ? this.buffer.shift() : this.buffer[0];
    }

    public getLast(remove: boolean = false): T | undefined {
        return this.buffer.length === 0 ? undefined : remove ? this.buffer.pop() : this.buffer[this.buffer.length - 1];
    }

    public clear(): void {
        this.buffer.length = 0;
    }
}