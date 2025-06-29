<?php

namespace App\Http\Requests\User;

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
        return [
            'date' => 'required|date',
            'check_in_time' => 'sometimes|required',
            'check_out_time' => 'sometimes|required',
            'check_in_location' => 'sometimes|required|string|min:2',
            'check_out_location' => 'sometimes|required|string|min:2',
            'photo' => 'required|string',
            'notes' => 'nullable|string',
            
            // Advanced location verification data
            'accuracy' => 'nullable|numeric',
            'altitude' => 'nullable|numeric',
            'speed' => 'nullable|numeric',
            'is_mocked' => 'nullable|string',
            'device_time' => 'nullable|numeric',
            'device_id' => 'nullable|string',
            'has_sensors' => 'nullable|string',
            'network_type' => 'nullable|string',
        ];
    }
}
