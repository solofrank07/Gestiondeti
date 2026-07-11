<?php

namespace App\Controllers\Admin;

use App\Controllers\Controller;
use App\Services\ETLService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ETLController extends Controller
{
    public function __construct(private ETLService $etlService) {}

    public function importCsv(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:10240',
        ]);

        $result = $this->etlService->importFromCsv($request->file('file'), $request->user());
        return response()->json($result);
    }

    public function importApi(Request $request): JsonResponse
    {
        $request->validate([
            'source' => 'required|string|max:100',
            'data'   => 'required|array',
            'data.*.latitude'  => 'required|numeric',
            'data.*.longitude' => 'required|numeric',
        ]);

        $result = $this->etlService->importFromExternalApi(
            $request->source, $request->data, $request->user()
        );
        return response()->json($result);
    }

    public function fetch(Request $request): JsonResponse
    {
        $request->validate(['source' => 'required|string|in:ministerio-interior,inei']);

        $data = $this->etlService->fetchFromSource($request->source);
        $result = $this->etlService->importFromExternalApi(
            $request->source, $data, $request->user()
        );

        return response()->json($result);
    }

    public function history(): JsonResponse
    {
        return response()->json($this->etlService->getHistory(50));
    }

    public function show(int $id): JsonResponse
    {
        $import = $this->etlService->getImportDetail($id);
        if (!$import) {
            return response()->json(['error' => 'Importación no encontrada'], 404);
        }
        return response()->json($import);
    }
}
