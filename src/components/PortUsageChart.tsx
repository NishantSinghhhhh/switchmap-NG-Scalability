import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface UsageData {
  date: string;        // e.g. '2025-03-01'
  uniqueHosts: number; // e.g. 5
}

function buildUsageData(arpData: any[]): UsageData[] {
  // Group by "day" -> track unique MAC
  const dailyMap: Record<string, Set<string>> = {};

  arpData.forEach((row) => {
    const dayStr = new Date(row.first_seen).toISOString().slice(0, 10);
    if (!dailyMap[dayStr]) dailyMap[dayStr] = new Set();
    dailyMap[dayStr].add(row.mac_address);
  });

  return Object.entries(dailyMap).map(([day, macSet]) => ({
    date: day,
    uniqueHosts: macSet.size,
  }));
}

export const PortUsageChart: React.FC<{ arpRows: any[], interfaceId: string }> = ({
  arpRows, interfaceId
}) => {
  const usageData = buildUsageData(arpRows);

  if (usageData.length < 1) {
    return <p>No usage data for interface {interfaceId}.</p>;
  }

  return (
    <div style={{ width: 600, height: 300 }}>
      <h3>Historic Usage for {interfaceId}</h3>
      <BarChart width={600} height={300} data={usageData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="uniqueHosts" fill="#8884d8" name="Host Count" />
      </BarChart>
    </div>
  );
};
