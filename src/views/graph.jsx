import { useState, useEffect, useMemo, useRef } from 'react';
import Select from 'react-select';
import { readAllInvoiceTrackerIds, readAllInvoiceTrackers } from "../requests";
import GoBackButton from '../components/GoBackButton';
import YearSelect from '../components/YearSelect';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, zoomPlugin);

const COLORS = [
  '#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed',
  '#0891b2', '#dc2626', '#4b5563', '#9333ea', '#0d9488',
  '#f59e0b', '#10b981'
];

export default function GraphPage() {
  const chartRef = useRef(null);
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [allData, setAllData] = useState([]);
  const [invoiceTrackers, setInvoiceTrackers] = useState([]);
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  // Current Month "Crop" Logic (March 2026 = index 2)
  const currentMonthIndex = new Date().getUTCMonth();
  const initialMin = Math.max(0, currentMonthIndex - 1);
  const initialMax = Math.min(11, currentMonthIndex + 1);

  const fetchData = async () => {
    try {
      const trackerIds = await readAllInvoiceTrackerIds();
      const formattedIds = trackerIds.map((acc) => ({ value: acc.id, label: acc.name }));
      setInvoiceTrackers(formattedIds);

      const results = await readAllInvoiceTrackers(yearFilter);
      setAllData(results || []);

      // Default: Select all accounts on first load
      if (formattedIds.length > 0 && selectedAccounts.length === 0) {
        setSelectedAccounts(formattedIds);
      }
    } catch (err) {
      console.error("Data Fetch Error:", err);
    }
  };

  useEffect(() => { fetchData(); }, [yearFilter]);

  // Aggregate invoices for YearSelect without re-fetching
  const flattenedInvoices = useMemo(() => allData.flatMap(t => t.Invoices || []), [allData]);

  const { chartData, stats } = useMemo(() => {
    if (!selectedAccounts.length || !allData.length) return { chartData: null, stats: null };

    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyTotals = new Array(12).fill(0);
    let grandTotal = 0;

    const datasets = selectedAccounts.map((account, index) => {
      const tracker = allData.find(t => t.id === account.value);
      const dataPoints = new Array(12).fill(0);

      tracker?.Invoices?.forEach(inv => {
        const m = new Date(inv.date).getUTCMonth();
        const cost = inv.cost || 0;
        dataPoints[m] = cost;
        monthlyTotals[m] += cost;
        grandTotal += cost;
      });

      return {
        label: account.label,
        data: dataPoints,
        borderColor: COLORS[index % COLORS.length],
        borderWidth: 2.5,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.25,
        fill: false,
      };
    });

    return {
      chartData: { labels, datasets },
      stats: {
        total: grandTotal,
        max: Math.max(...monthlyTotals, 1000)
      }
    };
  }, [selectedAccounts, allData]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] p-4 lg:p-8 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
          <div>
            <GoBackButton />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mt-4 italic uppercase">
              Visão de gastos
            </h1>
            <p className="text-slate-500 font-semibold tracking-wide uppercase text-xs mt-1">
              Consolidado de Contas • {yearFilter}
            </p>
          </div>

          <div className="bg-white px-8 py-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gasto Total Acumulado</span>
            <span className="text-3xl font-mono font-bold text-blue-600">
              R$ {stats?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || "0,00"}
            </span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Contas Selecionadas</label>
                <div className="flex gap-4 text-[10px] font-bold uppercase">
                  <button onClick={() => setSelectedAccounts(invoiceTrackers)} className="text-blue-600 hover:text-blue-800 transition">Marcar Todas</button>
                  <button onClick={() => setSelectedAccounts([])} className="text-slate-400 hover:text-slate-600 transition">Desmarcar Todas</button>
                </div>
              </div>
              <Select
                isMulti
                options={invoiceTrackers}
                value={selectedAccounts}
                onChange={setSelectedAccounts}
                className="react-select-container"
                styles={selectStyles}
              />
            </div>

            <div className="w-full lg:w-48">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-2">Ano Fiscal</label>
              <YearSelect
                invoices={flattenedInvoices}
                selectedYear={yearFilter}
                setSelectedYear={setYearFilter}
              />
            </div>
          </div>
        </div>

        {/* The Graph */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-200 p-8 h-[650px] relative overflow-hidden">
          <div className="absolute top-6 right-10 z-10 flex gap-2">
            <button
              onClick={() => chartRef.current.resetZoom()}
              className="bg-slate-900 text-white text-[10px] font-black px-4 py-2 rounded-full hover:bg-blue-600 transition shadow-lg"
            >
              RESET ZOOM
            </button>
          </div>

          {chartData ? (
            <Line
              ref={chartRef}
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                  x: {
                    min: initialMin,
                    max: initialMax,
                    grid: { display: false },
                    ticks: { font: { weight: '700', size: 12 }, color: '#64748b' }
                  },
                  y: {
                    beginAtZero: true,
                    min: 0,
                    border: { display: false },
                    grid: { color: '#f1f5f9' },
                    ticks: {
                      padding: 10,
                      callback: (v) => `R$ ${v.toLocaleString('pt-BR')}`,
                      font: { size: 11, weight: '600' },
                      color: '#94a3b8'
                    }
                  }
                },
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 30, font: { size: 12, weight: '600' } }
                  },
                  zoom: {
                    pan: { enabled: true, mode: 'x' },
                    zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' }
                  },
                  tooltip: tooltipConfig
                }
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 italic font-medium">
               Nenhuma conta selecionada para exibição.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const selectStyles = {
  control: (base) => ({
    ...base,
    borderRadius: '12px',
    padding: '2px',
    borderColor: '#e2e8f0',
    boxShadow: 'none',
    '&:hover': { borderColor: '#cbd5e1' }
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    color: '#2563eb'
  })
};

const tooltipConfig = {
  backgroundColor: '#0f172a',
  padding: 16,
  titleFont: { size: 14, weight: 'bold' },
  bodyFont: { size: 13 },
  bodySpacing: 10,
  cornerRadius: 12,
  mode: 'index',
  intersect: false,
  callbacks: {
    // This adds a "Total" line at the bottom of the tooltip
    footer: (tooltipItems) => {
      let sum = 0;
      tooltipItems.forEach((item) => {
        sum += item.parsed.y;
      });
      return `TOTAL: R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    },
    label: (ctx) => ` ${ctx.dataset.label}: R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  },
  footerFont: { size: 14, weight: 'bold' },
  footerMarginTop: 10,
  footerColor: '#38bdf8',
};