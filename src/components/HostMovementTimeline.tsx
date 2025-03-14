import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList
} from 'recharts';

// A single segment: the host was on `interfaceName` from `start` to `end`.
interface MovementSegment {
  interfaceName: string;
  start: number; // epoch ms
  end: number;   // epoch ms
}

/**
 * Convert ARP table rows into an array of MovementSegments
 * Each row: { interface_id, device_id, first_seen, last_seen }
 * We'll combine `device_id + interface_id` into a user-friendly label
 */
function buildSegmentsFromArp(arpData: any[]): MovementSegment[] {
  return arpData.map((row) => {
    const startMs = new Date(row.first_seen).getTime();
    const endMs   = new Date(row.last_seen).getTime();
    return {
      interfaceName: `${row.device_id}/${row.interface_id}`,
      start: startMs,
      end: endMs
    };
  });
}

interface HostMovementTimelineProps {
  arpRows: any[]; // ARP data filtered for one host
}

export const HostMovementTimeline: React.FC<HostMovementTimelineProps> = ({ arpRows }) => {
  // Convert ARP rows into timeline segments
  const segments = buildSegmentsFromArp(arpRows);

  // We have to build Recharts-friendly data:
  // In this example, let's treat each segment as a "bar" starting at 'start' and going to 'end'.
  // Recharts doesn't have a built-in "horizontal timeline" chart, so we can fake it with a BarChart
  // that uses a custom domain from minTime to maxTime, and each "interfaceName" as a category.

  // 1) Figure out min and max time:
  const allTimes = segments.flatMap(seg => [seg.start, seg.end]);
  const minTime = Math.min(...allTimes);
  const maxTime = Math.max(...allTimes);

  // 2) Group by interfaceName so we can render them on separate "rows"
  //    Each interface row might have multiple segments, so we can store them in an array.
  //    For simplicity, assume one record per interface — or we merge them. 
  //    We'll store start/end in custom fields for Recharts to interpret.

  // Transform each interfaceName + times into an object like:
  // { interfaceName: 'switch01/Gi1/0/24', startTime: 1679800000000, endTime: 1679803600000 }
  // Then we can do a stacked bar from startTime to endTime.

  // Let's do the simplest approach: one bar per segment, "interfaceName" is on Y-axis, time on X-axis
  const chartData = segments.map((seg, index) => ({
    id: index,
    interfaceName: seg.interfaceName,
    // We'll store "startTime" as e.g. "startVal" and "barSize" as "lengthVal"
    // so that Recharts can place the bar from startVal to startVal+lengthVal
    startVal: seg.start,
    lengthVal: seg.end - seg.start,
  }));

  return (
    <div style={{ width: '100%', height: 400 }}>
      <BarChart
        data={chartData}
        layout="vertical"  // make bars horizontal
        width={700}
        height={400}
        margin={{ top: 20, right: 20, bottom: 20, left: 100 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          domain={[minTime, maxTime]}
          scale="time"
          tickFormatter={(val) => new Date(val).toLocaleDateString()}
        />
        <YAxis
          dataKey="interfaceName"
          type="category"
          width={150}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'startVal') return new Date(value as number).toLocaleString();
            if (name === 'lengthVal') {
              const lenMs = Number(value);
              return `${(lenMs / 3600000).toFixed(1)} hrs total`;
            }
            return value;
          }}
          labelFormatter={() => ''} // We rely on the "formatter"
        />
        <Legend />
        <Bar
          dataKey="lengthVal"
          name="Time on Interface"
          fill="#82ca9d"
          barSize={20}
          background={false}
          // Use "startVal" as the "base" for the bar
          xAxisId={0}
        >
          {/* This LabelList could show e.g. how many hours, or "start -> end" */}
          <LabelList
            dataKey="lengthVal"
            position="inside"
            formatter={(idx: number) => {
              const seg: { startVal: number; lengthVal: number } = chartData[idx];
              const startStr: string = new Date(seg.startVal).toLocaleString();
              const endStr: string = new Date(seg.startVal + seg.lengthVal).toLocaleString();
              return `${startStr} ~ ${endStr}`;
            }}
          />
        </Bar>
      </BarChart>
    </div>
  );
};
