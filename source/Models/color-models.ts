export class RGB {
    constructor(public red: number, public green: number, public blue: number) {}
}

export class RGBA extends RGB {
    constructor(public red: number, public green: number, public blue: number, public alpha: number) {
        super(red, green, blue);
    }
}