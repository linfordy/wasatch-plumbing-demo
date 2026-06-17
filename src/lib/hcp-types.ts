// Minimal HouseCall Pro type definitions.
// Only the fields the dashboard reads. NOT a complete API typing.

export interface HcpAddress {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

export interface HcpEmployee {
  id?: string;
  first_name?: string;
  last_name?: string;
}

export interface HcpCustomer {
  id?: string;
  first_name?: string;
  last_name?: string;
  lead_source?: string;
  jobs_count?: number;
  tags?: string[];
  notes?: string;
}

export interface HcpJobSchedule {
  scheduled_start?: string;
}

export interface HcpJob {
  id?: string;
  description?: string;
  work_status?: string;
  total_amount?: number; // cents
  lead_source?: string;
  created_at?: string;
  schedule?: HcpJobSchedule;
  customer?: HcpCustomer;
  assigned_employees?: HcpEmployee[];
  tags?: string[];
}

export interface HcpLead {
  id?: string;
  lead_source?: string;
  created_at?: string;
}

export interface HcpEstimate {
  id?: string;
  created_at?: string;
}
