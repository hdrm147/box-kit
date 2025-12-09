<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| BoxKit API Routes
|--------------------------------------------------------------------------
|
| These routes are loaded by the BoxKitServiceProvider and are
| protected by Nova's authentication middleware.
|
*/

// Export recommendations as CSV
Route::post('/export/csv', function () {
    // Export logic handled client-side, this is a placeholder
    return response()->json(['success' => true]);
});

// Get current pricing (if needed from backend in future)
Route::get('/pricing', function () {
    return response()->json([
        'message' => 'Pricing is handled client-side',
    ]);
});
