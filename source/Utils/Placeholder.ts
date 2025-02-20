interface PlaceholderContentInterface {
    [key: string]: string | ((value: string, defaultValue: string) => string);
}

export class Placeholder {
    public placeholderText: string;
    public defaultValue: string;

    public constructor(placeholderText: string, defaultValue: string = "N/A") {
        this.placeholderText = placeholderText;
        this.defaultValue = defaultValue;
    }

    public parse(content: PlaceholderContentInterface): string {
        return Placeholder.parse(this.placeholderText, content, this.defaultValue);
    }

    public static parse(placeholderText: string, content: PlaceholderContentInterface, defaultValue: string = "N/A"): string {
        return placeholderText.replace(/\{(\w+)\}/g, (_, key) => {
            const value = content[key];

            if (value) {
                return typeof value === "function"
                    ? value(key, defaultValue)
                    : value;
            }

            return defaultValue;
        });
    }
}