// utils/generateInterfaceTrafficData.ts
export const generateInterfaceTrafficData = () => {
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
      });
    }
    return data;
  };
  