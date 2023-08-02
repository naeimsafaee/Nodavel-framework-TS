
abstract class FormRequest{

    abstract rules(): {};

}

export default FormRequest


/*
public function rules() {
    return [
        "amount" => ['string', 'gt:0', 'required'],
        'coin_id' => ['required' , 'exists:coins,id'],
        'campain_id' => 'nullable|exists:campains,id',
];
}*/
