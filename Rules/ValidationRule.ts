abstract class ValidationRule {

    public parts: string[] = [];

    abstract validate(attribute: string, value: any, fail: (message: string) => void): void;

    isNumeric(value: string) {
        return /^\d+$/.test(value);
    }
}

export default ValidationRule
