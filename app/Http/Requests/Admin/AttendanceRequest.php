<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceRequest extends FormRequest
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
                'employee_id'   => 'required|exists:employees,id',
                'date'          => 'required|date',
                'check_in_time' => 'required|date_format:H:i:s',
                'check_in_location' => 'nullable|string',
                'check_out_time' => 'nullable|date_format:H:i:s',
                'check_out_location' => 'nullable|string',
                'status'        => 'required|in:present,absent,late,early_out,on_leave,sick,overtime,no_check_out',
                'notes'         => 'nullable|string',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $attendance = $this->route('attendance');

            return [
                'employee_id'   => 'required|exists:employees,id',
                'date'          => 'required|date',
                'check_in_time' => 'required|date_format:H:i:s',
                'check_in_location' => 'nullable|string',
                'check_out_time' => 'nullable|date_format:H:i:s',
                'check_out_location' => 'nullable|string',
                'status'        => 'required|in:present,absent,late,early_out,on_leave,sick,overtime,no_check_out',
                'notes'         => 'nullable|string',
            ];
        }
    }
}
