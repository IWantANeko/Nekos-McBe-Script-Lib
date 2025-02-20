export interface Vector3Interface {
    x: number;
    y: number;
    z: number;
}

export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    public constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public static fromObject(obj: Vector3Interface): Vector3 {
        return new Vector3(obj.x, obj.y, obj.z);
    }

    public static fromString(str: string): Vector3 | never {
        const matches: RegExpMatchArray | null = str.match(/-?(\d+((\.|,)\d+)?)/g);

        if (matches === null || matches.length !== 3) {
            throw new Error(`Invalid vector string: ${str}`);
        }

        const x: number = Number(matches[0]),
            y: number = Number(matches[1]),
            z: number = Number(matches[2]);

        if (isNaN(x) || isNaN(y) || isNaN(z)) {
            throw new Error(`Invalid vector string: ${str}`);
        }

        return new Vector3(x, y, z);
    }

    public static fromArray(arr: [number, number, number]): Vector3 {
        return new Vector3(arr[0], arr[1], arr[2]);
    }

    public equals(vector: Vector3 | Vector3Interface): boolean {
        return this.x === vector.x && this.y === vector.y && this.z === vector.z;
    }

    public toString(separator: string=", "): string {
        return `${this.x}${separator}${this.y}${separator}${this.z}`;
    }

    public toArray(): [number, number, number] {
        return [this.x, this.y, this.z];
    }

    public toObject(): Vector3Interface {
        return { x: this.x, y: this.y, z: this.z };
    }

    public copy(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    public add(int: number): Vector3 {
        this.x += int;
        this.y += int;
        this.z += int;
        return this;
    }

    public subtract(int: number): Vector3 {
        this.x -= int;
        this.y -= int;
        this.z -= int;
        return this;
    }

    public multiply(int: number): Vector3 {
        this.x *= int;
        this.y *= int;
        this.z *= int;
        return this;
    }

    public divide(int: number): Vector3 {
        this.x /= int;
        this.y /= int;
        this.z /= int;
        return this;
    }

    public addByVector(vector: Vector3 | Vector3Interface): Vector3 {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        return this;
    }

    public subtractByVector(vector: Vector3 | Vector3Interface): Vector3 {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        return this;
    }

    public multiplyByVector(vector: Vector3 | Vector3Interface): Vector3 {
        this.x *= vector.x;
        this.y *= vector.y;
        this.z *= vector.z;
        return this;
    }

    public divideByVector(vector: Vector3 | Vector3Interface): Vector3 {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        return this;
    }

    public distanceTo(vector: Vector3 | Vector3Interface): number {
        return Math.sqrt(
            Math.pow(this.x - vector.x, 2) +
            Math.pow(this.y - vector.y, 2) +
            Math.pow(this.z - vector.z, 2)
        );
    } 
}