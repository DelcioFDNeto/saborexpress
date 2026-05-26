<?php

namespace App\Http\Controllers;

use App\Repositories\Dashboard\DashboardRepositoryInterface;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly DashboardRepositoryInterface $dashboard
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'period' => $request->query('period', 'all'),
            'operator_id' => $request->query('operator_id'),
            'payment_method' => $request->query('payment_method'),
            'channel' => $request->query('channel'),
        ];

        $data = $this->dashboard->getDashboardData($filters);

        return response()->json($data);
    }
}
