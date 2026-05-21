<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tables = [
            // Tables of 2
            ['number' => 'T01', 'capacity' => 2, 'status' => 'Livre'],
            ['number' => 'T02', 'capacity' => 2, 'status' => 'Livre'],
            ['number' => 'T03', 'capacity' => 2, 'status' => 'Livre'],
            ['number' => 'T04', 'capacity' => 2, 'status' => 'Livre'],
            // Tables of 4
            ['number' => 'T05', 'capacity' => 4, 'status' => 'Livre'],
            ['number' => 'T06', 'capacity' => 4, 'status' => 'Livre'],
            ['number' => 'T07', 'capacity' => 4, 'status' => 'Livre'],
            ['number' => 'T08', 'capacity' => 4, 'status' => 'Livre'],
            // Tables of 6
            ['number' => 'T09', 'capacity' => 6, 'status' => 'Livre'],
            ['number' => 'T10', 'capacity' => 6, 'status' => 'Livre'],
            ['number' => 'T11', 'capacity' => 6, 'status' => 'Livre'],
            ['number' => 'T12', 'capacity' => 6, 'status' => 'Livre'],
        ];

        foreach ($tables as $table) {
            \App\Models\Table::firstOrCreate(
                ['number' => $table['number']],
                $table
            );
        }
    }
}
