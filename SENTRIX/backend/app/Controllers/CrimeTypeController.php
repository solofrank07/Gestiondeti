<?php

namespace App\Controllers;

use App\Models\CrimeType;
use Illuminate\Http\JsonResponse;

class CrimeTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            CrimeType::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug', 'severity_weight', 'icon', 'color', 'description'])
        );
    }
}
