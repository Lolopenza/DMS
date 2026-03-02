import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Hub from './pages/Hub.jsx';
import Calculator from './pages/Calculator.jsx';
import Roadmap from './pages/Roadmap.jsx';
import Combinatorics from './pages/Combinatorics.jsx';
import Logic from './pages/Logic.jsx';
import SetTheory from './pages/SetTheory.jsx';
import GraphTheory from './pages/GraphTheory.jsx';
import Automata from './pages/Automata.jsx';
import NumberTheory from './pages/NumberTheory.jsx';
import Probability from './pages/Probability.jsx';
import AdjacencyMatrix from './pages/AdjacencyMatrix.jsx';

export default function App() {
  const [chatHistory, setChatHistory] = useState([]);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout chatHistory={chatHistory} setChatHistory={setChatHistory}>
        <Routes>
          <Route path="/" element={<Hub />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/combinatorics" element={<Combinatorics />} />
          <Route path="/logic" element={<Logic />} />
          <Route path="/set-theory" element={<SetTheory />} />
          <Route path="/graph-theory" element={<GraphTheory />} />
          <Route path="/automata" element={<Automata />} />
          <Route path="/number-theory" element={<NumberTheory />} />
          <Route path="/probability" element={<Probability />} />
          <Route path="/adjacency-matrix" element={<AdjacencyMatrix />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
