<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class PositionRequest extends FormRequest
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
                'department_id' => 'required|exists:departments,id',
                'name'          => 'required',
                'code'          => 'required|unique:positions',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $position = $this->route('position');

            return [
                'department_id' => 'required|exists:departments,id',
                'name'          => 'required',
                'code'          => 'required|unique:positions,code,' . $position->id,
            ];
        }
    }
}
