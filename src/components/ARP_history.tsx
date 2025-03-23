import  { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  Network,
  Download,
} from 'lucide-react';
import { ARPHistoryEntry } from '../interfaces/types';

// Import the new components for the modal views:
import { MovementLineChart } from './MovementLineChart';
import { IPMACAssociationTable } from './IPMACAssociationTable';
import { HostUptimeDisplay } from './HostUptimeDisplay';
import { MovementHistoryTable } from './MovementHistoryTable'; // for "Details" view
import { PortUsageChart } from './PortUsageChart';


/**
 * Helper: Get the latest ARP record for each MAC address.
 */
function getLatestRecordsByMac(rows: ARPHistoryEntry[]): ARPHistoryEntry[] {
  const grouped: Record<string, ARPHistoryEntry[]> = {};
  rows.forEach(row => {
    if (!grouped[row.mac_address]) grouped[row.mac_address] = [];
    grouped[row.mac_address].push(row);
  });
  const latest: ARPHistoryEntry[] = [];
  for (const mac in grouped) {
    const records = grouped[mac];
    records.sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime());
    latest.push(records[0]);
  }
  return latest;
}

export function ARPHistoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');

  // Hard-coded ARP data with multiple intervals per MAC:
  const [allArpData] = useState<ARPHistoryEntry[]>([
    // MAC #1: 4 intervals (device movement)
    {
      first_seen: '2025-03-01T10:00:00Z',
      last_seen:  '2025-03-01T11:00:00Z',
      mac_address: '00:1A:2B:3C:4D:5E',
      ip_address:  '192.168.1.10',
      interface_id: 'Gi1/0/24',
      vlan_id: 10,
      device_id: 'switch01',
    },
    {
      first_seen: '2025-03-01T11:00:00Z',
      last_seen:  '2025-03-01T12:30:00Z',
      mac_address: '00:1A:2B:3C:4D:5E',
      ip_address:  '192.168.1.10',
      interface_id: 'Gi1/0/25',
      vlan_id: 10,
      device_id: 'switch01',
    },
    {
      first_seen: '2025-03-01T13:00:00Z',
      last_seen:  '2025-03-01T15:00:00Z',
      mac_address: '00:1A:2B:3C:4D:5E',
      ip_address:  '192.168.1.10',
      interface_id: 'Gi2/0/10',
      vlan_id: 10,
      device_id: 'switch02',
    },
    {
      first_seen: '2025-03-02T09:00:00Z',
      last_seen:  '2025-03-02T10:00:00Z',
      mac_address: '00:1A:2B:3C:4D:5E',
      ip_address:  '192.168.1.10',
      interface_id: 'Gi2/0/11',
      vlan_id: 10,
      device_id: 'switch02',
    },
    // MAC #2: 2 intervals
    {
      first_seen: '2025-03-03T09:00:00Z',
      last_seen:  '2025-03-03T10:00:00Z',
      mac_address: '00:AA:BB:CC:DD:EE',
      ip_address:  '192.168.1.20',
      interface_id: 'Gi1/0/30',
      vlan_id: 20,
      device_id: 'switch01',
    },
    {
      first_seen: '2025-03-03T10:15:00Z',
      last_seen:  '2025-03-03T11:30:00Z',
      mac_address: '00:AA:BB:CC:DD:EE',
      ip_address:  '192.168.1.20',
      interface_id: 'Gi2/0/9',
      vlan_id: 20,
      device_id: 'switch02',
    },
  ]);

  // Compute "latest" records for the table (one per MAC)
  const latestRows = getLatestRecordsByMac(allArpData);

  // Modal state for host details
  const [showHostMovement, setShowHostMovement] = useState(false);
  const [showPortUsage, setShowPortUsage] = useState(false);
  const [selectedMAC, setSelectedMAC] = useState<string | null>(null);
  const [selectedInterface, setSelectedInterface] = useState<string | null>(null);
  
  // New state for tab selection in the host details modal
  const [selectedTab, setSelectedTab] = useState<'details' | 'movement' | 'association' | 'uptime'>('details');

  // Table filter logic (applied to latestRows)
  const filteredTableData = latestRows.filter((entry) => {
    if (!searchTerm) return true;
    if (filterOption !== 'all') {
      return String(entry[filterOption as keyof ARPHistoryEntry])
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }
    return Object.values(entry).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleExport = () => {
    const csvContent = [
      ['First Seen', 'Last Seen', 'MAC Address', 'IP Address', 'Interface', 'VLAN', 'Device ID'].join(','),
      ...filteredTableData.map(entry =>
        [
          entry.first_seen,
          entry.last_seen,
          entry.mac_address,
          entry.ip_address,
          entry.interface_id,
          entry.vlan_id,
          entry.device_id,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'arp_history_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // When "MovementsUsage" is clicked, we show the modal with the tabbed view.
  // This modal will let you switch among: Details, Movement, IP–MAC Association, and Uptime.
  const handleViewMovementUsage = (mac: string) => {
    setSelectedMAC(mac);
    setShowHostMovement(true);
    setSelectedTab('details'); // default to Details tab
  };



  const closeModals = () => {
    setShowHostMovement(false);
    setShowPortUsage(false);
    setSelectedMAC(null);
    setSelectedInterface(null);
  };

  // For the modal, we use all ARP records for the selected MAC
  const hostMovementData = selectedMAC
    ? allArpData
        .filter(row => row.mac_address === selectedMAC)
        .map(row => ({ ...row, vlan_id: row.vlan_id ?? 0, device_id: row.device_id ?? 'Unknown' })) // Ensure vlan_id is always a number and device_id is defined
    : [];

  // For usage chart (optional)
  const portUsageData = selectedInterface
    ? allArpData.filter(row => row.interface_id === selectedInterface)
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Search & Filter Card */}
      <Card>
        <CardHeader className="flex flex-row items-center space-x-4">
          <Network className="w-8 h-8 text-blue-500" />
          <div>
            <CardTitle>ARP History Search</CardTitle>
            <CardDescription>
              Track and search historical device mappings (Latest per MAC)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search ARP entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterOption} onValueChange={setFilterOption}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                <SelectItem value="mac_address">MAC Address</SelectItem>
                <SelectItem value="ip_address">IP Address</SelectItem>
                <SelectItem value="interface_id">Interface</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{filteredTableData.length} Entries</Badge>
            {searchTerm && <Badge variant="outline">Filtered by: "{searchTerm}"</Badge>}
          </div>
        </CardContent>
      </Card>

      {/* Table: Show only the latest record per MAC */}
      <Card>
        <CardHeader>
          <CardTitle>ARP History (Latest per MAC)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>First Seen</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Interface</TableHead>
                  <TableHead>VLAN</TableHead>
                  <TableHead>Device ID</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTableData.map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(entry.first_seen).toLocaleString()}</TableCell>
                    <TableCell>{new Date(entry.last_seen).toLocaleString()}</TableCell>
                    <TableCell className="font-mono">{entry.mac_address}</TableCell>
                    <TableCell>{entry.ip_address}</TableCell>
                    <TableCell>{entry.interface_id}</TableCell>
                    <TableCell>{entry.vlan_id}</TableCell>
                    <TableCell>{entry.device_id}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewMovementUsage(entry.mac_address)}
                      >
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: For selected host, show a tabbed view */}
      {showHostMovement && selectedMAC && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md max-w-3xl w-full">
            <Button variant="outline" onClick={closeModals} className="mb-4">
              Close
            </Button>
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4">
              <Button
                variant={selectedTab === 'details' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('details')}
              >
                Details
              </Button>
              <Button
                variant={selectedTab === 'movement' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('movement')}
              >
                Movement
              </Button>
              <Button
                variant={selectedTab === 'association' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('association')}
              >
                IP–MAC Association
              </Button>
              <Button
                variant={selectedTab === 'uptime' ? 'default' : 'outline'}
                onClick={() => setSelectedTab('uptime')}
              >
                Uptime
              </Button>
            </div>
            {/* Tab Content */}
            {selectedTab === 'details' && <MovementHistoryTable arpRows={hostMovementData} />}
            {selectedTab === 'movement' && <MovementLineChart arpRows={hostMovementData} />}
            {selectedTab === 'association' && <IPMACAssociationTable arpRows={hostMovementData} />}
            {selectedTab === 'uptime' && <HostUptimeDisplay arpRows={hostMovementData} />}
          </div>
        </div>
      )}

      {/* Modal: Port Usage (optional) */}
      {showPortUsage && selectedInterface && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-md">
            <Button variant="outline" onClick={closeModals} className="mb-4">
              Close
            </Button>
            <PortUsageChart arpRows={portUsageData} interfaceId={selectedInterface} />
          </div>
        </div>
      )}
    </div>
  );
}
