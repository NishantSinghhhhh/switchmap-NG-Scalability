import { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Clock,
  Calendar,
  Network,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { parseISO } from 'date-fns/parseISO';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie
} from 'recharts';

const ITEMS_PER_PAGE = 10;

// Generate 50 mock interface traffic entries
const generateMockTrafficData = () => {
  const data = [];
  for (let i = 1; i <= 50; i++) {
    data.push({
      first_seen: `2025-03-${(i % 28 + 1).toString().padStart(2, '0')}T08:00:00Z`,
      last_seen: `2025-03-${(i % 28 + 1).toString().padStart(2, '0')}T18:00:00Z`,
      mac_address: `00:1A:2B:3C:4D:${(i + 10).toString(16).toUpperCase().padStart(2, '0')}`,
      ip_address: `192.168.0.${i}`,
      interface_id: `GigabitEthernet1/0/${i}`,
      device_id: `switch${(i % 5) + 1}`,
      in_bps: Math.floor(Math.random() * 10_000_000),
      out_bps: Math.floor(Math.random() * 10_000_000),
      utilization_pct: Math.floor(Math.random() * 100),
      vlan_id: Math.floor(Math.random() * 100),
    });
  }
  return data;
};

export function NetworkDataTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const data = useMemo(() => generateMockTrafficData(), []);
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatTimestamp = (timestamp: string) => {
    try {
      const parsedDate = parseISO(timestamp);
      return {
        fullDate: format(parsedDate, 'PPpp'),
        relativeTime: formatDistanceToNow(parsedDate, { addSuffix: true }),
        dateOnly: format(parsedDate, 'PP')
      };
    } catch {
      return {
        fullDate: timestamp,
        relativeTime: 'Invalid date',
        dateOnly: timestamp
      };
    }
  };

  const renderCell = (key: string, value: any) => {
    if (key === 'first_seen' || key === 'last_seen') {
      const formatted = formatTimestamp(value);
      return (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{formatted.dateOnly}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 text-gray-400" />
            <span>{formatted.relativeTime}</span>
          </div>
        </div>
      );
    }

    if (key === 'mac_address') {
      return (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      );
    }

    if (key === 'ip_address') {
      return (
        <div className="flex items-center space-x-2">
          <Network className="h-4 w-4 text-green-500" />
          <span>{value}</span>
        </div>
      );
    }

    if (key === 'in_bps' || key === 'out_bps') {
      return (
        <div className="text-right font-mono tabular-nums">
          {Number(value).toLocaleString()} bps
        </div>
      );
    }

    if (key === 'utilization_pct') {
      const pct = Number(value);
      return (
        <div className="flex items-center space-x-2 w-[120px]">
          <div className="w-full bg-muted h-2 rounded">
            <div
              className={`h-2 rounded ${
                pct < 50
                  ? 'bg-green-500'
                  : pct < 80
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className="text-xs font-medium w-10 text-right">{pct}%</span>
        </div>
      );
    }

    return value;
  };

  const columns = paginatedData.length > 0 ? Object.keys(paginatedData[0]) : [];

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Interface Traffic History</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead
                    key={column}
                    className="uppercase tracking-wider text-xs text-muted-foreground whitespace-nowrap"
                  >
                    {column.replace(/_/g, ' ')}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column}>
                      {renderCell(column, (item as any)[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardContent className="mt-6">
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {/* 1. Traffic Over Time */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">In/Out Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis dataKey="first_seen" tickFormatter={(v) => v.slice(5, 10)} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="in_bps" stroke="#8884d8" name="In" />
            <Line type="monotone" dataKey="out_bps" stroke="#82ca9d" name="Out" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* 2. Utilization by Interface */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Utilization %</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data.slice(0, 10)}>
            <XAxis dataKey="interface_id" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="utilization_pct" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* 3. Top Talkers by IP */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top IPs by Traffic</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={data
              .map((d) => ({
                ip: d.ip_address,
                traffic: d.in_bps + d.out_bps,
              }))
              .sort((a, b) => b.traffic - a.traffic)
              .slice(0, 10)}
          >
            <XAxis dataKey="ip" tick={{ fontSize: 10 }} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="traffic" fill="#4ade80" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* 4. VLAN Distribution */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">VLAN Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={Object.entries(
                data.reduce((acc, cur) => {
                  acc[cur.vlan_id] = (acc[cur.vlan_id] || 0) + 1;
                  return acc;
                }, {} as Record<number, number>)
              ).map(([vlan, count]) => ({ name: `VLAN ${vlan}`, value: count }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={60}
              fill="#8884d8"
              label
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* 5. Device Load Summary */}
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Device Load</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={Object.entries(
              data.reduce((acc, cur) => {
                if (!acc[cur.device_id]) {
                  acc[cur.device_id] = { device_id: cur.device_id, in_bps: 0, out_bps: 0 };
                }
                acc[cur.device_id].in_bps += cur.in_bps;
                acc[cur.device_id].out_bps += cur.out_bps;
                return acc;
              }, {} as Record<string, { device_id: string; in_bps: number; out_bps: number }>)
            ).map(([, val]) => val)}
          >
            <XAxis dataKey="device_id" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="in_bps" stackId="a" fill="#60a5fa" name="In" />
            <Bar dataKey="out_bps" stackId="a" fill="#f87171" name="Out" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>
</CardContent>

    </Card>
  );
}
