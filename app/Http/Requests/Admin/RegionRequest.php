<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RegionRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->isMethod('post')) {
            return [
                'name'     => 'required',
                'code'     => 'required|unique:regions',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $region = $this->route('region');

            return [
                'name'     => 'required',
                'code'     => 'required|unique:regions,code,' . $region->id,
            ];
        }
    }
}
