export interface Ticket {
  id: string;
  text: string;
  timestamp?: string;
}

export interface TicketCluster {
  category: string;
  emoji: string;
  count: number;
  tickets: string[];
  priority: "critical" | "high" | "medium" | "low";
  pattern_summary: string;
  draft_response: string;
  suggest_doc: boolean;
  doc_title?: string;
}

export interface AnalysisResult {
  clusters: TicketCluster[];
  total_tickets: number;
  top_issue: string;
  health_score: number;
}
