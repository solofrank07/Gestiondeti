<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService
{
    public function attach(Model $model, UploadedFile $file, string $type = 'image'): Media
    {
        $filename = Str::ulid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("media/{$model->getTable()}/{$model->id}", $filename, 'public');

        return $model->media()->create([
            'type' => $type,
            'filename' => $filename,
            'original_name' => $file->getClientOriginalName(),
            'path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
        ]);
    }

    public function delete(Media $media): bool
    {
        Storage::disk('public')->delete($media->path);
        return $media->delete();
    }
}
