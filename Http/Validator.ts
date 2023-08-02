import FormRequest from "./FormRequest";
import Required from "../Rules/Required";
import ValidationRule from "../Rules/ValidationRule";
import UnprocessableEntity from "../Exceptions/UnprocessableEntity";
import Min from "../Rules/Min";
import Numeric from "../Rules/Numeric";

type ClassMapping = {
    [key: string]: new ({}) => ValidationRule;
};

const classMap: ClassMapping = {
    required: Required,
    min: Min,
    numeric: Numeric,
};

class Validator {

    rules: {};

    constructor(request: FormRequest) {
        this.rules = request.rules();
    }

    validate(data: any) {
        Object.entries(this.rules).forEach(([attribute, rulesObject]) => {

            const value = data[attribute];

            Object.entries(rulesObject as {}).forEach(([index, rule]) => {


                if (typeof rule == 'string') {
                    const ruleParts = rule.split(":");
                    const ruleName = ruleParts[0];

                    if (classMap.hasOwnProperty(ruleName)) {

                        const instance = new classMap[ruleName](data);
                        instance.parts = ruleParts;

                        instance.validate(attribute, value, (message: string) => {
                            throw new UnprocessableEntity(Validator.prepareMessage(message, attribute, ruleParts));
                        });

                    }
                }


            });

        });

    }

    private static prepareMessage(message: string, attribute: string, ruleParts: string[]): string {
        message = message?.replace(":attribute", attribute);

        if (ruleParts.length > 1)
            message = message?.replace(`:${ruleParts[0]}`, ruleParts[1]);

        return message;
    }
}

export default Validator
