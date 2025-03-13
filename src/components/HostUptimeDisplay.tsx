import React from 'react';

interface ARPRow {
  first_seen: string;
  last_seen: string;
}

interface HostUptimeDisplayProps {
  arpRows: ARPRow[];
}

/** Utility to merge overlapping intervals */
function mergeIntervals(intervals: { start: number; end: number }[]): { start: number; end: number }[] {
  if (intervals.length === 0) return [];
  intervals.sort((a, b) => a.start - b.start);
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const last = merged[merged.length - 1];
    if (intervals[i].start <= last.end) {
      last.end = Math.max(last.end, intervals[i].end);
    } else {
      merged.push(intervals[i]);
    }
  }
  return merged;
}

export const HostUptimeDisplay: React.FC<HostUptimeDisplayProps> = ({ arpRows }) => {
  if (!arpRows || arpRows.length === 0) {
    return <p>No uptime data available.</p>;
  }

  // Convert each ARP record to an interval in ms.
  const intervals = arpRows.map(row => ({
    start: new Date(row.first_seen).getTime(),
    end: new Date(row.last_seen).getTime(),
  }));

  const mergedIntervals = mergeIntervals(intervals);

  // Calculate total uptime from merged intervals.
  const uptimeMs = mergedIntervals.reduce((sum, interval) => sum + (interval.end - interval.start), 0);

  // Total period from earliest first_seen to latest last_seen.
  const minTime = Math.min(...intervals.map(i => i.start));
  const maxTime = Math.max(...intervals.map(i => i.end));
  const totalPeriodMs = maxTime - minTime;

  const uptimePercent = totalPeriodMs ? (uptimeMs / totalPeriodMs) * 100 : 0;

  // Utility: convert ms to hours.
  const msToHours = (ms: number) => (ms / 3600000).toFixed(2);

  return (
    <div className="mt-4">
      <h3 className="mb-2 text-lg font-semibold">Host Uptime Summary</h3>
      <p>
        Uptime: {uptimePercent.toFixed(2)}% ({msToHours(uptimeMs)} hours up out of {msToHours(totalPeriodMs)} total hours)
      </p>
      <div className="overflow-x-auto mt-4">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Interval #</th>
              <th className="border p-2">Start</th>
              <th className="border p-2">End</th>
              <th className="border p-2">Duration (hrs)</th>
            </tr>
          </thead>
          <tbody>
            {mergedIntervals.map((interval, idx) => (
              <tr key={idx}>
                <td className="border p-2 text-center">{idx + 1}</td>
                <td className="border p-2">{new Date(interval.start).toLocaleString()}</td>
                <td className="border p-2">{new Date(interval.end).toLocaleString()}</td>
                <td className="border p-2 text-center">{msToHours(interval.end - interval.start)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
