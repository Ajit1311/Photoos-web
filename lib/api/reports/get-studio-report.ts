
import {
  supabase,
} from "@/lib/supabase/client";

import type {
  StudioReport,
} from "@/types/reports/studio-report";


export async function getStudioReport(
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
    StudioReport
  > {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_studio_reports",
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


  return data as StudioReport;

}

