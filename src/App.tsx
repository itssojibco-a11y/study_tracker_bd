import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StudyHub } from './components/StudyHub';
import { SalahTracker } from './components/SalahTracker';
import { Tasks } from './components/Tasks';
import { Finance } from './components/Finance';

// Placeholders for other routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-in fade-in">
    <h2 className="text-2xl font-semibold mb-2">{title}</h2>
    <p>Module is under construction.</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/study" element={<StudyHub />} />
          <Route path="/salah" element={<SalahTracker />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/habits" element={<Placeholder title="Habit Tracker" />} />
          <Route path="/health" element={<Placeholder title="Health Tracker" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
