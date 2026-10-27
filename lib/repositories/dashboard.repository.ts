import {
  getDashboardSummary,
} from "@/lib/api/dashboard";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";

class DashboardRepository {

  async load(): Promise<DashboardSummaryResponse> {

    const response =
      await getDashboardSummary();

    return response;

  }

}

export const dashboardRepository =
  new DashboardRepository();