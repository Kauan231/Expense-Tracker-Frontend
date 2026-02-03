import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";

import AddDocumentModal from "./components/AddDocumentModal";
import AddInvoiceModal from "./components/AddInvoiceTracker";
import AddNewPeriodModal from "./components/AddNewPeriod";

import {
  saveDocument,
  saveInvoiceTracker,
  createInvoicePeriod,
  readAllInvoices,
  readAllInvoiceTrackerIds,
  readAllInvoiceTracker,
} from "./requests";


function MenuContainer({
  color = "bg-red-500",
  text = "Criar nova conta",
  textColor = "text-white",
}) {
  return (
    <div
      className={`
        w-40 sm:w-52 md:w-60 lg:w-64
        h-40 sm:h-52 md:h-60 lg:h-64
        ${color}
        rounded-2xl shadow-lg
        flex items-center justify-center
        transition-all duration-300 transform
        hover:scale-105 hover:shadow-2xl
        cursor-pointer
      `}
    >
      <h1
        className={`
          text-center
          text-sm sm:text-lg md:text-xl lg:text-2xl
          font-extrabold
          ${textColor}
          drop-shadow-md
          tracking-wide
        `}
      >
        {text}
      </h1>
    </div>
  );
}

function Summary({ totalCost }) {
  return (
    <div className="w-full sm:w-11/12 md:w-3/4 lg:w-2/3 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
        Resumo de custos de{" "}
        {new Date()
          .toLocaleString("default", { month: "long" })
          .toLocaleUpperCase()}
      </h2>
      <p className="text-md sm:text-lg md:text-xl text-gray-700">
        Total: <span className="font-bold text-gray-900">{totalCost}</span>
      </p>
    </div>
  );
}

function PendingInvoices({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="p-4 bg-green-100 text-green-800 rounded-md text-center">
        ✅ Todas as faturas do mês foram pagas.
      </div>
    );
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-md">
      <h2 className="text-lg font-semibold mb-2 text-yellow-800">
        ⚠️ Faturas Vencidas/Pendentes
      </h2>
      <ul className="list-disc list-inside space-y-1">
        {messages.map((msg, index) => (
          <li
            key={index}
            className="text-yellow-900 bg-yellow-100 p-2 rounded-md"
          >
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [documentModalOpen, setDocumentModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [periodModalOpen, setPeriodModalOpen] = useState(false);

  const [totalCost, setTotalCost] = useState(false);
  const [pendingMessages, setPendingMessages] = useState([]);

  const handleSaveDocument = async (document) => {
    const requestBody = {
      file: document.documentFile,
      type: document.type,
      invoiceId: document.invoiceId,
      cost: document.cost,
    };

    await saveDocument(requestBody);
    setDocumentModalOpen(false);
  };

  const handleSaveInvoice = async (invoice) => {
    try {
      await saveInvoiceTracker(invoice);
    } catch (e) {
      console.log("Cannot save invoice", e);
    }
    setInvoiceModalOpen(false);
  };

  const handleSavePeriod = async (period) => {
    try {
      await createInvoicePeriod(period);
    } catch (e) {
      console.log("Cannot save invoice", e);
    }
    setPeriodModalOpen(false);
  };

  const getPageInfo = async () => {
    let allInvoiceTrackers = await readAllInvoiceTrackerIds();
    let allInvoiceTrackerIds = allInvoiceTrackers.map((tracker) => tracker.id);

    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const monthName = new Date(year, month - 1)
      .toLocaleString("pt-Br", { month: "long" })
      .toLocaleUpperCase();

    const today = new Date().getDate();

    let pendingMessages = [];

    for (let id of allInvoiceTrackerIds) {
      let tracker = await readAllInvoiceTracker(id, year, month);
      const invoices = tracker.Invoices ?? [];
      const dueDate = tracker.dueDate;

      const invoiceForMonth = invoices.find((inv) => {
        const invDate = new Date(inv.date);
        return (
          invDate.getFullYear() === year &&
          invDate.getMonth() + 1 === month
        );
      });

      if (invoiceForMonth?.status !== 1) {
        if (today > dueDate) {
          pendingMessages.push(
            `❗ "${tracker.name}" → Nenhum comprovante enviado para o período ${monthName} ${year}. A fatura venceu em ${dueDate}.`
          );
        } else {
          pendingMessages.push(
            `⚠️ "${tracker.name}" → Nenhum comprovante enviado para o período ${monthName} ${year}. A data de vencimento é ${dueDate}.`
          );
        }
      }
    }

    setPendingMessages(pendingMessages);

    let results = await readAllInvoices(year, month);
    let total = results.reduce((acc, curr) => acc + (curr.cost ?? 0), 0);
    setTotalCost(total);
  };

  useEffect(() => {
    getPageInfo();
  }, []);

  useEffect(() => {
    getPageInfo();
  }, [periodModalOpen, invoiceModalOpen, documentModalOpen]);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-sky-900 via-indigo-800 to-purple-900 flex flex-col items-center p-4 sm:p-6 gap-6">
      <Summary
        totalCost={new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(totalCost)}
      />
      <div className="w-full flex flex-wrap justify-center gap-6 max-w-7xl">
        <button onClick={() => setDocumentModalOpen(true)}>
          <MenuContainer text="Adicionar Documento" color="bg-red-500" />
        </button>

        <Link to="/invoices">
          <MenuContainer text="Faturas" color="bg-blue-400" />
        </Link>

        <button onClick={() => setInvoiceModalOpen(true)}>
          <MenuContainer text="Adicionar Nova Fatura" color="bg-yellow-400" />
        </button>

        <button onClick={() => setPeriodModalOpen(true)}>
          <MenuContainer text="Adicionar Novo Período" color="bg-green-400" />
        </button>
      </div>

      <div className="max-w-xl mx-auto mt-10">
        <PendingInvoices messages={pendingMessages} />
      </div>

      <AddDocumentModal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        onSave={handleSaveDocument}
      />

      <AddInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
      />

      <AddNewPeriodModal
        isOpen={periodModalOpen}
        onClose={() => setPeriodModalOpen(false)}
        onSave={handleSavePeriod}
      />
    </div>
  );
}

export default App;