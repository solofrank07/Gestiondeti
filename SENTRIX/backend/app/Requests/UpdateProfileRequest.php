<?php

namespace App\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:150',
            'phone' => 'nullable|string|max:20',
            'photo' => 'nullable|image|max:2048',
        ];
    }
}
