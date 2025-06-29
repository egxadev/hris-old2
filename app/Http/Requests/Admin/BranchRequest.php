<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class BranchRequest extends FormRequest
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
                'region_id' => 'required|exists:regions,id',
                'name'     => 'required',
                'code'     => 'required|unique:branches',
                'address'  => 'required',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'geofence_radius' => 'nullable|integer|min:10|max:1000',
            ];
        }

        if ($this->isMethod('put') || $this->isMethod('patch')) {
            $branch = $this->route('branch');

            return [
                'region_id' => 'required|exists:regions,id',
                'name'     => 'required',
                'code'     => 'required|unique:branches,code,' . $branch->id,
                'address'  => 'required',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'geofence_radius' => 'nullable|integer|min:10|max:1000',
            ];
        }
    }
}
