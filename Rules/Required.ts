import ValidationRule from "./ValidationRule";

class Required extends ValidationRule {

    data: any;

    constructor(data: any) {
        super();
        this.data = data;
    }

    validate(attribute:string, value:any, fail: (message: string) => void): void {
        if(!this.data[attribute])
            fail(":attribute is required");
    }

}

export default Required
