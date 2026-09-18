<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'Laravel JWT Auth API. See routes/api.php for endpoints under /api.',
    ]);
});
