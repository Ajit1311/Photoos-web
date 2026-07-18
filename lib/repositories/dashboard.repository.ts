import {
  getDashboardSummary,
} from "@/lib/api/dashboard";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";

class DashboardRepository {

  async load(): Promise<DashboardSummaryResponse> {
    return getDashboardSummary();
  }

}

export const dashboardRepository =
  new DashboardRepository();