<?php

namespace App\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'nullable|string|max:255',
            'crime_type_id' => 'nullable|exists:crime_types,id',
            'category_id' => 'nullable|exists:categories,id',
            'incident_date' => 'required|date|before_or_equal:now',
            'priority' => 'nullable|in:baja,media,alta,critica',
            'radius' => 'nullable|integer|min:0|max:5000',
            'is_anonymous' => 'nullable|boolean',
            'media' => 'nullable|array',
            'media.*' => 'file|mimes:jpg,jpeg,png,gif,mp4,mov,avi|max:51200',
        ];
    }
}
