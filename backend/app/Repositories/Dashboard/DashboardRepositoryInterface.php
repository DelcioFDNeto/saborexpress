<?php

namespace App\Repositories\Dashboard;

interface DashboardRepositoryInterface
{
    /**
     * Get aggregated dashboard data including KPIs, top products, revenue chart,
     * payment methods, channels breakdown, and operator sales ranking.
     *
     * @param array $filters
     * @return array
     */
    public function getDashboardData(array $filters): array;
}
