<?php
try {
    DB::connection()->getPdo();
    echo "SUCCESS: Connected to DB\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
