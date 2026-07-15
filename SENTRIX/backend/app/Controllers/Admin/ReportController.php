<?php

namespace App\Controllers\Admin;

use App\Controllers\Controller;
use App\Models\Report;
use App\Resources\ReportResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $status = $request->input('status'); // 'pending', 'verified', 'all'

        $query = Report::with(['crimeType', 'category', 'status', 'user']);

        if ($status === 'pending') {
            $query->where('is_verified', false)
                ->where(fn($q) => $q->whereDoesntHave('status')
                    ->orWhereHas('status', fn($s) => $s->where('slug', '!=', 'rechazado')));
        } elseif ($status === 'verified') {
            $query->where('is_verified', true);
        } elseif ($status === 'rejected') {
            $query->whereHas('status', fn($q) => $q->where('slug', 'rechazado'));
        }

        $reports = $query->latest()->paginate($perPage);
        return response()->json(ReportResource::collection($reports));
    }
}
