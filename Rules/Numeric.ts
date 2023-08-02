import ValidationRule from "./ValidationRule";

class Numeric extends ValidationRule {

    data: any;

    constructor(data: any) {
        super();
        this.data = data;
    }

    validate(attribute:string, value:any, fail: (message: string) => void): void {

        if(value && !this.isNumeric(value))
            fail(`The :attribute must be a number.`);
    }


}

export default Numeric
