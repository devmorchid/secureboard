<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | For local development we allow the dev server origins and enable credentials.
    | Adjust this for production to list only trusted origins.
    |
    */

    // Match all routes during development to avoid missing preflight coverage.
    'paths' => ['*'],

    // Allow all common methods (preflight will be successful).
    'allowed_methods' => ['*'],

    // Explicitly allow your frontend dev origins. Use the FRONTEND_URL env var as primary.
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:8080'),
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://192.168.11.154:8080',
    ],

    // If you prefer patterns instead (less explicit), you can use allowed_origins_patterns.
    'allowed_origins_patterns' => [],

    // Allow all headers (dev convenience).
    'allowed_headers' => ['*'],

    // Expose no special headers by default; add any you need here.
    'exposed_headers' => [],

    'max_age' => 0,

    // Must be true for cookie-based Sanctum auth
    'supports_credentials' => true,
];