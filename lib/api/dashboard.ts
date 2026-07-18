import { supabase } from '../supabase/client';

// १. नवीन प्रॉफिट समरीचा इंटरफेस
export interface StudioProfitSummary {
  total_revenue: number;
  total_expense: number;
  net_profit: number;
  profit_margin_percentage: number;
}

// २. जुन्या डॅशबोर्ड समरीचा डीफॉल्ट इंटरफेस (एरर टाळण्यासाठी)
export interface DashboardSummaryResponse {
  // तुझ्या प्रोजेक्टच्या गरजेनुसार यात मूळ व्हेरिएबल्स अप्लाय होतील
  [key: string]: any; 
}

/**
 * जुने फंक्शन जे रिपॉझिटरी शोधत आहे (Error Fix)
 */
export async function getDashboardSummary(studioId?: string): Promise<DashboardSummaryResponse | null> {
  // जर तुझ्याकडे डॅशबोर्ड समरीचा विशिष्ट RPC किंवा टेबल कॉल असेल तर तो इथे होईल
  const { data, error } = await supabase
    .rpc('get_dashboard_summary', { p_studio_id: studioId }); // किंवा जो तुझा जुना RPC होता

  if (error) {
    console.error('Error fetching dashboard summary:', error);
    // बॅकअप म्हणून सिस्टीम क्रॅश न होता रिकामी ऑब्जेक्ट पाठवू
    return {};
  }

  return data;
}

/**
 * नवीन स्टुडिओचा निव्वळ नफा, खर्च आणि रेव्हेन्यू समरी मिळवण्यासाठी RPC कॉल
 */
export async function fetchStudioNetProfitSummary(studioId: string): Promise<StudioProfitSummary | null> {
  const { data, error } = await supabase.rpc('get_studio_net_profit_summary', {
    p_studio_id: studioId
  });

  if (error) {
    console.error('Error fetching P&L dashboard data:', error);
    return null;
  }

  return data as StudioProfitSummary;
}