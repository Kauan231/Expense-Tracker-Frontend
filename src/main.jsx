import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import InvoicePage from './views/invoices.jsx';
import GraphPage from './views/graph.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <App />
        }
        />
        <Route path="/invoices" element={
          <InvoicePage />
        }
        />

        <Route path="/graph" element={
          <GraphPage />
        }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
