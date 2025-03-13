import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from '@/components/ui/table';

interface ARPRow {
  first_seen: string;
  last_seen: string;
  mac_address: string;
  ip_address: string;
  interface_id: string;
  vlan_id: number;
  device_id: string;
}

interface IPMACAssociationTableProps {
  arpRows: ARPRow[];
}

export const IPMACAssociationTable: React.FC<IPMACAssociationTableProps> = ({ arpRows }) => {
  // Group ARP entries by IP address.
  const grouped = arpRows.reduce((acc: Record<string, ARPRow[]>, row) => {
    if (!acc[row.ip_address]) {
      acc[row.ip_address] = [];
    }
    acc[row.ip_address].push(row);
    return acc;
  }, {});

  // Convert groups to summary rows.
  const summaryRows = Object.entries(grouped).map(([ip, rows]) => {
    // Sort by first_seen ascending.
    rows.sort(
      (a, b) =>
        new Date(a.first_seen).getTime() - new Date(b.first_seen).getTime()
    );
    return {
      ip_address: ip,
      interface_id: rows[0].interface_id, // or list them if multiple
      device_id: rows[0].device_id,         // you can customize as needed
      first_seen: rows[0].first_seen,
      last_seen: rows[rows.length - 1].last_seen,
    };
  });

  return (
    <div className="overflow-x-auto mt-6">
      <h3 className="mb-4 text-lg font-semibold">IP–MAC Association</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>IP Address</TableCell>
            <TableCell>Interface</TableCell>
            <TableCell>Device</TableCell>
            <TableCell>First Seen</TableCell>
            <TableCell>Last Seen</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summaryRows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{row.ip_address}</TableCell>
              <TableCell>{row.interface_id}</TableCell>
              <TableCell>{row.device_id}</TableCell>
              <TableCell>{new Date(row.first_seen).toLocaleString()}</TableCell>
              <TableCell>{new Date(row.last_seen).toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
