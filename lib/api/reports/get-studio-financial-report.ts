
import {
  supabase,
} from "@/lib/supabase/client";

import type {
  StudioFinancialReport,
} from "@/types/reports/studio-report";


export async function getStudioFinancialReport(
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
    StudioFinancialReport
  > {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_studio_financial_report",
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


  return data as StudioFinancialReport;

}

