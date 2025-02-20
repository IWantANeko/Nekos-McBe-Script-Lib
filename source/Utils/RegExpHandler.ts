export class RegExpHandler {
    static stringify(regExp: RegExp): string {
        return `${regExp.source}\x1F${regExp.flags}`;
    }

    static parse(regExp: string): RegExp {
        const [source, flags] = regExp.split('\x1F');
        return new RegExp(source, flags);
    }
}