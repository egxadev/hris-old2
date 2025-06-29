<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isUpdateMode = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $employee = $isUpdateMode ? $this->route('employee') : null;
        
        $userRules = [
            'user.name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'user.email' => [
                'sometimes', 
                'nullable', 
                'email', 
                'max:255',
                $isUpdateMode && $employee && $employee->user_id
                    ? Rule::unique('users', 'email')->ignore($employee->user_id)
                    : Rule::unique('users', 'email')
            ],
            'user.password' => $isUpdateMode
                ? ['sometimes', 'nullable', 'string', 'min:8', 'confirmed']
                : ['sometimes', 'nullable', 'required_with:user.email', 'string', 'min:8', 'confirmed'],
            'user.password_confirmation' => ['sometimes', 'nullable', 'string', 'min:8'],
            'user.roles' => ['sometimes', 'nullable', 'array'],
            'user.roles.*' => ['sometimes', 'nullable', 'exists:roles,id'],
        ];

        return array_merge([
            'region_id' => ['required', 'string', 'exists:regions,id'],
            'branch_id' => ['required', 'string', 'exists:branches,id'],
            'department_id' => ['required', 'string', 'exists:departments,id'],
            'position_id' => ['required', 'string', 'exists:positions,id'],
            'employee_code' => ['required', 'string', 'max:50'],
            'employee_type' => ['required', 'integer'],
            'employee_status' => ['required', 'integer'],
            'joined_at' => ['required', 'date'],
            'resigned_at' => ['nullable', 'date', 'after_or_equal:joined_at'],
            'nik' => ['required', 'string', 'max:20'],
            'npwp' => ['nullable', 'string', 'max:25'],
            'citizenship' => ['required', 'string', 'max:50'],
            'phone_number' => ['required', 'string', 'max:20'],
            'photo_path' => ['nullable', 'string'],
            'address' => ['required', 'string'],
            'birth_place' => ['required', 'string', 'max:100'],
            'birth_date' => ['required', 'date'],
            'gender' => ['required', 'integer'],
            'blood_type' => ['nullable', 'string', 'max:5'],
            'religion' => ['required', 'integer'],
            'education' => ['required', 'string', 'max:20'],
        ], $userRules);
    }
}
