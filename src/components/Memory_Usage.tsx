import { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Memory_Usage = () => {
  const [range, setRange] = useState<'1w' | '1m' | '1y' | 'all'>('1w');

  // Hardcoded memory data mirroring CPU component structure
  const allMemoryData = {
    '1w': [
      { timestamp: '2025-03-20T00:00:00Z', used: 512, total: 1024 },
      { timestamp: '2025-03-21T00:00:00Z', used: 600, total: 1024 },
      { timestamp: '2025-03-22T00:00:00Z', used: 700, total: 1024 },
      { timestamp: '2025-03-23T00:00:00Z', used: 750, total: 1024 },
      { timestamp: '2025-03-24T00:00:00Z', used: 800, total: 1024 },
      { timestamp: '2025-03-25T00:00:00Z', used: 650, total: 1024 },
      { timestamp: '2025-03-26T00:00:00Z', used: 850, total: 1024 },
    ],
    '1m': Array.from({ length: 30 }, (_, i) => ({
      timestamp: `2025-02-${(i + 1).toString().padStart(2, '0')}T00:00:00Z`,
      used: Math.round(500 + Math.sin(i / 3) * 200),
      total: 1024
    })),
    '1y': Array.from({ length: 12 }, (_, i) => ({
      timestamp: `2025-${(i + 1).toString().padStart(2, '0')}-01T00:00:00Z`,
      used: Math.round(600 + Math.sin(i) * 150),
      total: 1024
    })),
    all: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `2023-${(i % 12 + 1).toString().padStart(2, '0')}-01T00:00:00Z`,
      used: Math.round(700 + Math.cos(i) * 100),
      total: 1024
    })),
  };

  const data = allMemoryData[range];
  const current = data[data.length - 1];
  const usagePercent = ((current.used / current.total) * 100).toFixed(1);

  // Memory status color coding
  const getMemoryStatusColor = (percent: number) => {
    if (percent < 50) return 'text-green-600';
    if (percent < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">Memory Usage</CardTitle>
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

        {/* Current Memory Usage */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              Current Memory Usage:{' '}
              <span className={`ml-2 ${getMemoryStatusColor(Number(usagePercent))}`}>
                {current.used} MB / {current.total} MB ({usagePercent}%)
              </span>
            </div>
            {Number(usagePercent) > 80 && (
              <div className="text-sm text-red-500 font-medium">
                High Memory Usage Alert!
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <Progress 
            value={Number(usagePercent)} 
            className={`w-full h-2 ${
              Number(usagePercent) < 50 
                ? 'bg-green-200' 
                : Number(usagePercent) < 80 
                  ? 'bg-yellow-200' 
                  : 'bg-red-200'
            }`} 
          />
        </div>

        {/* Memory Chart */}
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="memoryColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
              domain={[0, 1024]}
              unit=" MB"
              label={{ value: 'Memory (MB)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleString()}
              formatter={(value) => [`${value} MB`, 'Memory Used']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="used"
              stroke="#82ca9d"
              fillOpacity={1}
              fill="url(#memoryColor)"
              name="Memory Used"
            />
          </AreaChart>
        </ResponsiveContainer>

        <div className="mt-4 text-sm text-gray-600">
          Monitor memory usage trends to identify potential performance bottlenecks or memory leaks.
        </div>
      </CardContent>
    </Card>
  );
};

export default Memory_Usage;