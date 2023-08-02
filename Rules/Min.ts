import ValidationRule from "./ValidationRule";

class Min extends ValidationRule {

    data: any;

    constructor(data: any) {
        super();
        this.data = data;
    }

    validate(attribute:string, value:any, fail: (message: string) => void): void {

        const min = parseInt(this.parts[1]);

        if(value && this.isNumeric(value) && parseFloat(value) < min)
            return fail(`The :attribute must be at least :min.`);

        if(value && !this.isNumeric(value) && value.length < min)
            return fail(`The :attribute must be at least :min characters.`);
    }

}

export default Min
