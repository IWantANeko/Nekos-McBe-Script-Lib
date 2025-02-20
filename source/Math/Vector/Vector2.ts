export interface Vector2Interface {
    x: number;
    y: number;
}

export class Vector2 {
    public x: number;
    public y: number;

    public constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    public static fromObject(obj: Vector2Interface): Vector2 {
        return new Vector2(obj.x, obj.y);
    }

    public static fromString(str: string): Vector2 | never {
        const matches: RegExpMatchArray | null = str.match(/-?(\d+((\.|,)\d+)?)/g);

        if (matches === null || matches.length !== 2) {
            throw new Error(`Invalid vector string: ${str}`);
        }

        const x: number = Number(matches[0]),
            y: number = Number(matches[1]);

        if (isNaN(x) || isNaN(y)) {
            throw new Error(`Invalid vector string: ${str}`);
        }

        return new Vector2(x, y);
    }

    public static fromArray(arr: [number, number]): Vector2 {
        return new Vector2(arr[0], arr[1]);
    }

    public equals(vector: Vector2 | Vector2Interface): boolean {
        return this.x === vector.x && this.y === vector.y;
    }

    public toString(separator: string=", "): string {
        return `${this.x}${separator}${this.y}`;
    }

    public toArray(): [number, number] {
        return [this.x, this.y];
    }

    public toObject(): Vector2Interface {
        return { x: this.x, y: this.y };
    }

    public copy(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public add(int: number): Vector2 {
        this.x += int;
        this.y += int;
        return this;
    }

    public subtract(int: number): Vector2 {
        this.x -= int;
        this.y -= int;
        return this;
    }

    public multiply(int: number): Vector2 {
        this.x *= int;
        this.y *= int;
        return this;
    }

    public divide(int: number): Vector2 {
        this.x /= int;
        this.y /= int;
        return this;
    }

    public addByVector(vector: Vector2 | Vector2Interface): Vector2 {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }

    public subtractByVector(vector: Vector2 | Vector2Interface): Vector2 {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }

    public multiplyByVector(vector: Vector2 | Vector2Interface): Vector2 {
        this.x *= vector.x;
        this.y *= vector.y;
        return this;
    }

    public divideByVector(vector: Vector2 | Vector2Interface): Vector2 {
        this.x /= vector.x;
        this.y /= vector.y;
        return this;
    }

    public distanceTo(vector: Vector2 | Vector2Interface): number {
        return Math.sqrt(
            Math.pow(this.x - vector.x, 2) +
            Math.pow(this.y - vector.y, 2)
        );
    } 
}