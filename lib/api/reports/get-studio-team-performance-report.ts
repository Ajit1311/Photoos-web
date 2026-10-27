import {
  supabase,
} from "@/lib/supabase/client";

import type {
  StudioTeamPerformanceReport,
} from "@/types/reports/studio-report";


export async function getStudioTeamPerformanceReport(
  studioId:
    string,

  fromDate:
    string
    | null =
      null,

  toDate:
    string
    | null =
      null,
):
  Promise<
    StudioTeamPerformanceReport
  > {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_studio_team_performance_report",
      {
        p_studio_id:
          studioId,

        p_from_date:
          fromDate,

        p_to_date:
          toDate,
      },
    );


  if (
    error
  ) {

    throw error;

  }


  return data as StudioTeamPerformanceReport;

}
