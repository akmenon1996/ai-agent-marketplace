export interface Agent {
  id: number;
  name: string;
  description: string;
  type: string;
  price: number;
  developer_id: number;
  is_active: boolean;
  is_purchased: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentData {
  name: string;
  description: string;
  type: string;
  price: number;
}

export interface UpdateAgentData {
  name?: string;
  description?: string;
  type?: string;
  price?: number;
  is_active?: boolean;
}

export interface InterviewPrepRequest {
  topic: string;
  experience_level?: string;
  context?: string;
}

export interface CodeReviewRequest {
  code: string;
  language?: string;
  context?: string;
}

export interface ResumeReviewRequest {
  resume_text: string;
  context?: string;
}

export interface WritingAssistantRequest {
  text: string;
  style?: string;
  context?: string;
}

export interface TechnicalTroubleshootingRequest {
  problem: string;
  system_info?: string;
  context?: string;
}

export interface AgentInvocationRequest {
  agent_type: string;
  code_review?: CodeReviewRequest;
  resume_review?: ResumeReviewRequest;
  interview_prep?: InterviewPrepRequest;
  writing_assistant?: WritingAssistantRequest;
  technical_troubleshooting?: TechnicalTroubleshootingRequest;
}

export interface AgentInvocationResponse {
  id: number;
  purchase_id: number;
  agent_id: number;
  input_data: string;
  output_data?: string;
  tokens_used: number;
  created_at: string;
  agent_name: string;
}

export interface AgentPurchaseResponse {
  agent_id: number;
  purchase_id: number;
  purchase_price: number;
  remaining_balance: number;
}

export interface TimeSeriesData {
  timestamp: string;
  invocations: number;
  success_rate: number;
  average_response_time: number;
}

export interface AgentAnalytics {
  id: number;
  name: string;
  time_series: TimeSeriesData[];
}

export interface AgentMetrics {
  agent_id: number;
  agent_name: string;
  timeSeries: TimeSeriesData[];
}
