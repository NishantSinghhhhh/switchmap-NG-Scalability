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

interface MovementHistoryTableProps {
  arpRows: ARPRow[];
}

export const MovementHistoryTable: React.FC<MovementHistoryTableProps> = ({ arpRows }) => {
  return (
    <div className="overflow-x-auto mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>First Seen</TableCell>
            <TableCell>Last Seen</TableCell>
            <TableCell>Interface</TableCell>
            <TableCell>Device</TableCell>
            <TableCell>IP Address</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {arpRows.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell>{new Date(row.first_seen).toLocaleString()}</TableCell>
              <TableCell>{new Date(row.last_seen).toLocaleString()}</TableCell>
              <TableCell>{row.interface_id}</TableCell>
              <TableCell>{row.device_id}</TableCell>
              <TableCell>{row.ip_address}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
