<?php

namespace App\Controllers\Admin;

use App\Controllers\Controller;
use App\Interfaces\ReportRepositoryInterface;
use App\Resources\ReportResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        private ReportRepositoryInterface $reportRepo
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 20);
        $status = $request->input('status'); // 'pending', 'verified', 'all'

        $reports = $this->reportRepo->findAllAdmin($status, $perPage);
        return response()->json(ReportResource::collection($reports));
    }
}
