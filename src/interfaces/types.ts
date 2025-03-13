// Types for different network data models
export interface InterfaceTrafficData {
    time: string;
    in_bps: number;
    out_bps: number;
    utilization_pct: number;
  }
  
  export interface DeviceStatusData {
    timestamp: string;
    status: 'up' | 'down';
  }
  
  export interface ARPHistoryEntry {
    first_seen: string;
    last_seen: string;
    mac_address: string;
    ip_address: string;
    interface_id: string;
    vlan_id?: number;
    device_id?: string;
    in_bps?: number;
    out_bps?: number;
    utilization_pct?: number;
  }
  
  export interface NetworkDataTableProps<T> {
    data: T[];
    title: string;
  }