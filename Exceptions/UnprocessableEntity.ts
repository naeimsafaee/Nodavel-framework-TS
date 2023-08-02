import Exception from "./Exception";

class UnprocessableEntity extends Exception {

    constructor(message: string = "") {
        super(message ||
            'UnprocessableEntity', 422);
    }
}


export default UnprocessableEntity