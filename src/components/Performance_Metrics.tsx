
import { Tabs } from '@/components/ui/tabs';
import CPU_Usage from './CPU_Usage';
import Memory_Usage from './Memory_Usage';

const Performance_Metrics = () => {
  return (
    <Tabs defaultValue="cpu" className="w-[90%]">
        <CPU_Usage />
     
        <Memory_Usage />

    </Tabs>
  );
};

export default Performance_Metrics;