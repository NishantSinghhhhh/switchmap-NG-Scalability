
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { NetworkDashboard } from './components/NetworkDashboard';
import { ARPHistoryPage } from './components/ARP_history';
import Performance_Metrics from './components/Performance_Metrics';
import InterfaceStatsDashboard from './components/Interface_Statistics';

function App() {
  return (
    <Router>
      {/* Top NavBar */}
      <nav className="bg-gray-800 text-white p-4 shadow-md">
        <ul className="flex space-x-6 justify-center font-medium">
          <li>
            <Link to="/" className="hover:text-blue-300">Interface Traffic History</Link>
          </li>
          <li>
            <Link to="/arp-history" className="hover:text-blue-300">ARP History</Link>
          </li>
          <li>
            <Link to="/performance" className="hover:text-blue-300">Performance Metrics</Link>
          </li>
          <li>
            <Link to="/InterfaceStatsDashboard" className="hover:text-blue-300">Interface StatsDashboard</Link>
          </li>
        </ul>
      </nav>

      {/* Page Content */}
      <div className="p-6">
        <Routes>
          <Route path="/" element={<NetworkDashboard />} />
          <Route path="/arp-history" element={<ARPHistoryPage />} />
          <Route path="/performance" element={<Performance_Metrics />} />
          <Route path="/InterfaceStatsDashboard" element={<InterfaceStatsDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
