<?php

namespace Database\Seeders;

use App\Models\Table;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        $tables = [

            ['number' => 'T01', 'capacity' => 2, 'status' => 'Livre'],
            ['number' => 'T02', 'capacity' => 2, 'status' => 'Livre'],
            ['number' => 'T03', 'capacity' => 2, 'status' => 'Livre'],
            ['number' => 'T04', 'capacity' => 2, 'status' => 'Livre'],

            ['number' => 'T05', 'capacity' => 4, 'status' => 'Livre'],
            ['number' => 'T06', 'capacity' => 4, 'status' => 'Livre'],
            ['number' => 'T07', 'capacity' => 4, 'status' => 'Livre'],
            ['number' => 'T08', 'capacity' => 4, 'status' => 'Livre'],

            ['number' => 'T09', 'capacity' => 6, 'status' => 'Livre'],
            ['number' => 'T10', 'capacity' => 6, 'status' => 'Livre'],
            ['number' => 'T11', 'capacity' => 6, 'status' => 'Livre'],
            ['number' => 'T12', 'capacity' => 6, 'status' => 'Livre'],
        ];

        foreach ($tables as $table) {
            Table::firstOrCreate(
                ['number' => $table['number']],
                $table
            );
        }
    }
}
