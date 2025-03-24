import  { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';

const CPU_Usage = () => {
  const [range, setRange] = useState<'1w' | '1m' | '1y' | 'all'>('1w');

  // Hardcoded data for each range
  const allCpuData = {
    '1w': [
      { timestamp: '2025-03-20T00:00:00Z', usage: 20 },
      { timestamp: '2025-03-21T00:00:00Z', usage: 25 },
      { timestamp: '2025-03-22T00:00:00Z', usage: 35 },
      { timestamp: '2025-03-23T00:00:00Z', usage: 40 },
      { timestamp: '2025-03-24T00:00:00Z', usage: 45 },
      { timestamp: '2025-03-25T00:00:00Z', usage: 30 },
      { timestamp: '2025-03-26T00:00:00Z', usage: 50 },
    ],
    '1m': Array.from({ length: 30 }, (_, i) => ({
      timestamp: `2025-02-${(i + 1).toString().padStart(2, '0')}T00:00:00Z`,
      usage: Math.round(30 + Math.sin(i / 3) * 20),
    })),
    '1y': Array.from({ length: 12 }, (_, i) => ({
      timestamp: `2025-${(i + 1).toString().padStart(2, '0')}-01T00:00:00Z`,
      usage: Math.round(40 + Math.sin(i) * 15),
    })),
    all: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `2023-${(i % 12 + 1).toString().padStart(2, '0')}-01T00:00:00Z`,
      usage: Math.round(50 + Math.cos(i) * 10),
    })),
  };

  const data = allCpuData[range];
  const current = data[data.length - 1].usage;

  const getCpuStatusColor = (usage: number) => {
    if (usage < 30) return 'text-green-600';
    if (usage < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">CPU Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Range Toggle */}
        <div className="mb-4 flex gap-2 justify-end">
          {['1w', '1m', '1y', 'all'].map((r) => (
            <Button
              key={r}
              size="sm"
              variant={range === r ? 'default' : 'outline'}
              onClick={() => setRange(r as typeof range)}
            >
              {{
                '1w': '1 Week',
                '1m': '1 Month',
                '1y': '1 Year',
                all: 'All Time',
              }[r]}
            </Button>
          ))}
        </div>

        {/* Current CPU Usage */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">
            Current CPU Usage:{' '}
            <span className={`ml-2 ${getCpuStatusColor(current)}`}>
              {current.toFixed(1)}%
            </span>
          </div>
          {current > 70 && (
            <div className="text-sm text-red-500 font-medium">
              High CPU Usage Alert!
            </div>
          )}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) =>
                new Date(v).toLocaleDateString(undefined, {
                  month: 'short',
                  day: range === '1y' || range === 'all' ? 'numeric' : undefined,
                })
              }
            />
            <YAxis
              domain={[0, 100]}
              unit="%"
              label={{ value: 'CPU %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(label) =>
                new Date(label).toLocaleString()
              }
              formatter={(value) => [`${value}%`, 'CPU Usage']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="#8884d8"
              strokeWidth={2}
              name="CPU %"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-4 text-sm text-gray-600">
          View CPU usage over different time ranges to identify performance patterns.
        </div>
      </CardContent>
    </Card>
  );
};

export default CPU_Usage;
