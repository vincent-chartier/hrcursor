import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import JobPostings from './pages/JobPostings';
import Candidates from './pages/Candidates';
import Prospects from './pages/Prospects';
import Interviews from './pages/Interviews';
import { TestGemini } from './components/TestGemini';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Navigate to="/postings" replace />} />
          <Route path="/postings" element={<JobPostings />} />
          <Route path="/candidates" element={<Candidates />} />
          <Route path="/prospects" element={<Prospects />} />
          <Route path="/interviews" element={<Interviews />} />
          <Route path="/interviews/:id" element={<Interviews />} />
          <Route path="/test-gemini" element={<TestGemini />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 