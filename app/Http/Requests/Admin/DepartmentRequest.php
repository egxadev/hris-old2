<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class DepartmentRequest extends FormRequest
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
                'branch_id' => 'required|exists:branches,id',
                'name'     => 'required',
                'code'     => 'required|unique:departments',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $department = $this->route('department');

            return [
                'branch_id' => 'required|exists:branches,id',
                'name'     => 'required',
                'code'     => 'required|unique:departments,code,' . $department->id,
            ];
        }
    }
}
