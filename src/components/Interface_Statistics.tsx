import React, { useState, ChangeEvent } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
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
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

/** Options for the time range filter. */
type TimeRange = 'week' | 'month' | 'year' | 'all' | 'custom';

/** Structure of a single point in our historical data. */
interface HistoryPoint {
  timestamp: string;
  inOctets: number;
  outOctets: number;
  inErrors: number;
  outErrors: number;
  inDiscards: number;
  outDiscards: number;
}

interface InterfaceStat {
  name: string;
  status: 'up' | 'down';
  speed: number; // in Mbps
  inErrors: number;
  outErrors: number;
  inDiscards: number;
  outDiscards: number;
  history: HistoryPoint[];
}

/**
 * Example data generator (slightly random) for demonstration.
 */
const generateHistory = (days: number): HistoryPoint[] => {
  const now = new Date();
  const history: HistoryPoint[] = [];

  let lastInOctets = 1_000_000_000;
  let lastOutOctets = 2_000_000_000;
  let lastInErrors = 0;
  let lastOutErrors = 0;
  let lastInDiscards = 0;
  let lastOutDiscards = 0;

  for (let i = 0; i < days; i++) {
    const pointDate = new Date(now);
    pointDate.setDate(now.getDate() - (days - 1 - i));

    // Random increments to simulate variation
    lastInOctets += Math.floor(Math.random() * 5_000_000 + 500_000);
    lastOutOctets += Math.floor(Math.random() * 6_000_000 + 1_000_000);

    // Random chance of errors/discards
    if (Math.random() < 0.3) lastInErrors += Math.floor(Math.random() * 3);
    if (Math.random() < 0.2) lastOutErrors += Math.floor(Math.random() * 2);
    if (Math.random() < 0.25) lastInDiscards += Math.floor(Math.random() * 2);
    if (Math.random() < 0.1) lastOutDiscards += Math.floor(Math.random() * 1);

    history.push({
      timestamp: pointDate.toISOString(),
      inOctets: lastInOctets,
      outOctets: lastOutOctets,
      inErrors: lastInErrors,
      outErrors: lastOutErrors,
      inDiscards: lastInDiscards,
      outDiscards: lastOutDiscards
    });
  }
  return history;
};

/** Example interface data with 30 days of random history. */
const interfaceStats: InterfaceStat[] = [
  {
    name: 'Eth0/1',
    status: 'up',
    speed: 1000,
    inErrors: 6,
    outErrors: 3,
    inDiscards: 2,
    outDiscards: 1,
    history: generateHistory(30)
  },
  {
    name: 'Eth0/2',
    status: 'down',
    speed: 1000,
    inErrors: 0,
    outErrors: 0,
    inDiscards: 0,
    outDiscards: 0,
    history: generateHistory(30)
  }
];

const InterfaceStatsDashboard: React.FC = () => {
  const [selectedInterface, setSelectedInterface] = useState<InterfaceStat | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // For custom range, user-selected start/end dates (YYYY-MM-DD).
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  /**
   * Convert a date string (YYYY-MM-DD) to a Date object, or null if invalid.
   */
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
  };

  /**
   * Filter the interface's history by the chosen time range or custom date range.
   */
  const filterHistoryByRange = (history: HistoryPoint[]): HistoryPoint[] => {
    if (timeRange === 'all') {
      return history;
    }

    const now = new Date();
    let cutoff = new Date();

    switch (timeRange) {
      case 'week':
        cutoff.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoff.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoff.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom': {
        const customStart = parseDate(startDate);
        const customEnd = parseDate(endDate);
        if (customStart && customEnd) {
          return history.filter((point) => {
            const t = new Date(point.timestamp).getTime();
            return t >= customStart.getTime() && t <= customEnd.getTime();
          });
        } else if (customStart) {
          return history.filter((point) => new Date(point.timestamp) >= customStart);
        } else if (customEnd) {
          return history.filter((point) => new Date(point.timestamp) <= customEnd);
        } else {
          // If both are invalid/empty, return entire history
          return history;
        }
      }
      default:
        break;
    }

    return history.filter((point) => new Date(point.timestamp) >= cutoff);
  };

  /**
   * Create a new data series for the chart, combining inbound/outbound into single totals.
   *
   *  - trafficBps:  ( (inOctets + outOctets) difference ) / interval time
   *  - errors:      ( (inErrors + outErrors) difference )
   */
  const createChartSeries = (history: HistoryPoint[]) => {
    if (history.length < 2) return [];

    const series = [];
    for (let i = 1; i < history.length; i++) {
      const t0 = new Date(history[i - 1].timestamp).getTime();
      const t1 = new Date(history[i].timestamp).getTime();
      const intervalSec = (t1 - t0) / 1000;

      const prevInOct = history[i - 1].inOctets;
      const prevOutOct = history[i - 1].outOctets;
      const currInOct = history[i].inOctets;
      const currOutOct = history[i].outOctets;

      const prevTotalErr = history[i - 1].inErrors + history[i - 1].outErrors;
      const currTotalErr = history[i].inErrors + history[i].outErrors;

      // Byte difference
      const totalBytesDelta = (currInOct + currOutOct) - (prevInOct + prevOutOct);
      // Error difference
      const totalErrDelta = currTotalErr - prevTotalErr;

      series.push({
        timestamp: history[i].timestamp,
        trafficBps: Math.max(0, (totalBytesDelta * 8) / intervalSec),
        totalErrors: Math.max(0, totalErrDelta)
      });
    }
    return series;
  };

  /**
   * Render a single throughput vs. errors chart (2 Y-axes).
   */
  const renderChart = (history: HistoryPoint[]) => {
    const series = createChartSeries(history);
    if (series.length < 1) {
      return <p className="text-sm text-gray-500">Not enough data to show throughput.</p>;
    }

    // We'll look at the last item for "errors in the last interval".
    const last = series[series.length - 1];

    return (
      <>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={series}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              }
            />
            {/* Left axis for traffic BPS */}
            <YAxis
              yAxisId="left"
              stroke="#8884d8"
              tickFormatter={(val) => `${Math.round(val / 1000)}Kbps`}
            />
            {/* Right axis for total errors */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#ff0000"
              tickFormatter={(val) => `${val} err`}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(val, name) => {
                if (name === 'Traffic (bps)') {
                  return `${Math.round(Number(val))} bps`;
                }
                if (name === 'Errors') {
                  return `${val} errors`;
                }
                return val;
              }}
            />
            <Legend />

            {/* Single traffic line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="trafficBps"
              name="Traffic (bps)"
              stroke="#8884d8"
              strokeWidth={2}
              dot={false}
            />

            {/* Single errors line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalErrors"
              name="Errors"
              stroke="#ff0000"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-sm">
          <p className="text-gray-600">
            <strong>Errors in last interval:</strong>{' '}
            <span className={last.totalErrors > 0 ? 'text-red-600' : 'text-green-600'}>
              {`${last.totalErrors}`}
            </span>
          </p>
        </div>
      </>
    );
  };

  /**
   * Calculate utilization based on the last two data points:
   *  ( ( (currIn + currOut) - (prevIn + prevOut) ) * 8 ) / intervalSec / (iface.speed * 1,000,000) * 100
   */
  const calculateUtilization = (iface: InterfaceStat): string => {
    if (iface.history.length < 2) return '0.00';

    const h = iface.history;
    const prev = h[h.length - 2];
    const current = h[h.length - 1];

    const intervalSec = (new Date(current.timestamp).getTime() - new Date(prev.timestamp).getTime()) / 1000;
    const prevTotalBytes = prev.inOctets + prev.outOctets;
    const currentTotalBytes = current.inOctets + current.outOctets;
    const bytesDelta = currentTotalBytes - prevTotalBytes;
    const bps = (bytesDelta * 8) / intervalSec;
    const utilizationPercent = (bps / (iface.speed * 1_000_000)) * 100;
    return utilizationPercent.toFixed(2);
  };

  // Handlers for custom date range inputs
  const handleCustomStart = (e: ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setTimeRange('custom');
  };

  const handleCustomEnd = (e: ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setTimeRange('custom');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Interface Statistics</CardTitle>
        <CardDescription>
          Network interface performance, total errors, total discards, and throughput
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Time Range Buttons */}
        <div className="mb-4 space-x-2">
          {(['week', 'month', 'year', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm border ${
                timeRange === range ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
              }`}
            >
              {range === 'week'
                ? '1 Week'
                : range === 'month'
                ? '1 Month'
                : range === 'year'
                ? '1 Year'
                : 'All Time'}
            </button>
          ))}
          <button
            onClick={() => setTimeRange('custom')}
            className={`px-3 py-1 rounded text-sm border ${
              timeRange === 'custom' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Range Inputs */}
        {timeRange === 'custom' && (
          <div className="mb-4 flex items-center space-x-2">
            <label htmlFor="start" className="text-sm">
              Start:
            </label>
            <input
              id="start"
              type="date"
              value={startDate}
              onChange={handleCustomStart}
              className="border rounded p-1 text-sm"
            />
            <label htmlFor="end" className="text-sm">
              End:
            </label>
            <input
              id="end"
              type="date"
              value={endDate}
              onChange={handleCustomEnd}
              className="border rounded p-1 text-sm"
            />
          </div>
        )}

        {/* Interfaces Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Interface</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Errors</TableHead>
              <TableHead>Discards</TableHead>
              <TableHead>Utilization</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {interfaceStats.map((iface) => {
              // Instead of separate inbound/outbound, show total errors & total discards
              const totalErrors = iface.inErrors + iface.outErrors;
              const totalDiscards = iface.inDiscards + iface.outDiscards;

              // Apply highlighting if there are any errors
              return (
                <TableRow
                  key={iface.name}
                  className={totalErrors > 0 ? 'bg-yellow-50 hover:bg-yellow-100' : ''}
                >
                  <TableCell className="font-semibold">{iface.name}</TableCell>
                  <TableCell className={iface.status === 'up' ? 'text-green-600' : 'text-red-600'}>
                    {iface.status.toUpperCase()}
                  </TableCell>
                  {/* Show total errors & total discards (no inbound/outbound) */}
                  <TableCell>{totalErrors}</TableCell>
                  <TableCell>{totalDiscards}</TableCell>
                  <TableCell>{calculateUtilization(iface)}%</TableCell>
                  <TableCell>
                    <button
                      onClick={() => setSelectedInterface(iface)}
                      className="text-blue-600 hover:underline"
                    >
                      View Details
                    </button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {/* Detailed Chart Section */}
        {selectedInterface && (
          <div className="mt-8 border-t pt-4">
            <CardTitle className="text-sm mb-4">
              {selectedInterface.name} – Throughput &amp; Error Trend ({timeRange})
            </CardTitle>

            {renderChart(filterHistoryByRange(selectedInterface.history))}

            <p className="text-xs text-gray-500 mt-3">
              <strong>SNMP OIDs reference:</strong> ifInErrors (1.3.6.1.2.1.2.2.1.14), ifOutErrors
              (1.3.6.1.2.1.2.2.1.20), ifInDiscards (1.3.6.1.2.1.2.2.1.13), ifOutDiscards
              (1.3.6.1.2.1.2.2.1.19). Typically, errors may be CRC or alignment (inbound) or collisions
              (outbound), while discards often indicate buffer or congestion issues. Here, we’re
              displaying **totals** (in + out) to simplify the view.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterfaceStatsDashboard;
