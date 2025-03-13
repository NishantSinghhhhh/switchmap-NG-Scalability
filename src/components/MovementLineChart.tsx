import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

/** A single ARP row for a device. */
interface ARPRow {
  first_seen: string;   // e.g. '2025-03-01T10:00:00Z'
  last_seen:  string;
  mac_address: string;
  ip_address:  string;
  interface_id: string; // e.g. 'Gi1/0/24'
  vlan_id: number;
  device_id: string;    // e.g. 'switch01'
}

/** We define a data point for the line chart. */
interface MovementPoint {
  time: number;          // epoch ms
  interfaceIndex: number; 
}

/** 
 * Convert the ARP intervals for one device into an array of line-chart points.
 * 1) Sort rows by first_seen ascending
 * 2) Assign each unique interface a numeric index
 * 3) For each row, we create a single point at (row.first_seen, interfaceIndex).
 *    (You could also plot last_seen or multiple points if you want a "step" for durations.)
 */
function buildLinePoints(arpRows: ARPRow[]): { data: MovementPoint[], labelMap: string[] } {
  // Sort by first_seen
  const sorted = [...arpRows].sort((a,b) =>
    new Date(a.first_seen).getTime() - new Date(b.first_seen).getTime()
  );

  // Gather all unique interfaces in the order they appear
  const interfaceSet = new Set<string>();
  for (const row of sorted) {
    interfaceSet.add(`${row.device_id}/${row.interface_id}`);
  }
  // Convert to array so we can do index-based lookups
  const interfaceList = Array.from(interfaceSet);

  // Build data points
  const data: MovementPoint[] = sorted.map((row) => {
    const combinedName = `${row.device_id}/${row.interface_id}`;
    const interfaceIndex = interfaceList.indexOf(combinedName);
    return {
      time: new Date(row.first_seen).getTime(),
      interfaceIndex
    };
  });

  return { data, labelMap: interfaceList };
}

/**
 * Renders a line chart connecting the device's movements in chronological order.
 * The Y-axis is a numeric scale (0..N), but we display each interface name as a label.
 */
export const MovementLineChart: React.FC<{ arpRows: ARPRow[] }> = ({ arpRows }) => {
  if (!arpRows || arpRows.length < 1) {
    return <p>No movement data found.</p>;
  }

  // Build the data array + label map
  const { data, labelMap } = buildLinePoints(arpRows);

  if (data.length < 2) {
    return <p>Not enough intervals to show a movement line.</p>;
  }

  // The domain for X is min..max time, Y is 0..(labelMap.length-1)
  const minTime = Math.min(...data.map(d => d.time));
  const maxTime = Math.max(...data.map(d => d.time));

  return (
    <div style={{ width: 700, height: 400 }}>
      <h3>Movement Path (Line)</h3>
      <LineChart
        width={700}
        height={400}
        data={data}
        margin={{ top: 20, right: 30, bottom: 20, left: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="time"
          domain={[minTime, maxTime]}
          tickFormatter={(val) => new Date(val).toLocaleDateString()}
        />
        <YAxis
          type="number"
          domain={[0, labelMap.length - 1]}
          tickFormatter={(val) => labelMap[val] || ''}
          allowDecimals={false}
        />
        <Tooltip
          labelFormatter={(label) => new Date(label).toLocaleString()}
          formatter={(val, name) => {
            if (name === 'interfaceIndex') {
              return labelMap[val as number] || '';
            }
            return val;
          }}
        />
        {/* 
          type="monotone" draws a smooth line. 
          type="stepAfter" or "stepBefore" can show step transitions. 
        */}
        <Line
          type="stepAfter"
          dataKey="interfaceIndex"
          stroke="#8884d8"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
          name="Interface"
        />
      </LineChart>
    </div>
  );
};
