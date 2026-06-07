import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { StudyHub } from './components/StudyHub';
import { Tasks } from './components/Tasks';
import { Finance } from './components/Finance';
import { Goals } from './components/Goals';
import { Exams } from './components/Exams';

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
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
