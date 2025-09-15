import { useState } from 'react'
import './App.css'
import AddDocumentModal from './components/AddDocumentModal'
import AddInvoiceModal from './components/AddInvoiceTracker'
import { saveDocument, saveInvoiceTracker } from "./requests"

function MenuContainer({ color = "bg-red-500", text = "Criar nova conta", textColor = "text-white" }) {
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
  )
}

function Summary({ totalCost }) {
  return (
    <div className="w-full sm:w-11/12 md:w-3/4 lg:w-2/3 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-4 sm:p-6 mb-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Resumo de Custos</h2>
      <p className="text-md sm:text-lg md:text-xl text-gray-700">
        Total: <span className="font-bold text-gray-900">${totalCost}</span>
      </p>
    </div>
  )
}

function Reminders({ items }) {
  return (
    <div className="w-full sm:w-11/12 md:w-3/4 lg:w-2/3 bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">Lembretes</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-gray-700">
        {items.map((item, idx) => (
          <li key={idx} className="font-medium text-sm sm:text-base p-2 bg-gray-100 rounded-lg shadow-sm">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const totalCost = 1245.75
  const reminders = [
    "Enviar fatura do mês",
    "Revisar documentos pendentes",
    "Atualizar cadastro de clientes",
    "Verificar documentos antigos",
    "Preparar relatório financeiro",
    "Enviar notificações",
  ]

  const [documentModalOpen, setDocumentModalOpen] = useState(false)
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  const invoices = [
    { id: 1, name: 'Invoice 001' },
    { id: 2, name: 'Invoice 002' },
    { id: 3, name: 'Invoice 003' },
  ]

  const accounts = [
    { id: 1, name: 'Conta A' },
    { id: 2, name: 'Conta B' },
    { id: 3, name: 'Conta C' },
  ]

  const handleSaveDocument = async (document) => {
    console.log('Documento salvo:', document)
    const requestBody = {
        file: document.documentFile,
        type : document.type,
        invoiceId : document.invoiceId ,
        cost: document.cost,
    };

    await saveDocument(requestBody);

    setDocumentModalOpen(false)
  }

  const handleSaveInvoice = async (invoice) => {
    console.log('Configuração de fatura salva:', invoice)
    try { await saveInvoiceTracker(invoice);
    } catch(e) { console.log("Cannot save invoice", e); }
    setInvoiceModalOpen(false)
  }

  return (
    <div className="w-screen min-h-screen bg-gradient-to-r from-sky-900 via-indigo-800 to-purple-900 flex flex-col items-center p-4 sm:p-6 gap-6">
      {/* Resumo de custos */}
      <Summary totalCost={totalCost} />

      {/* Menu cards */}
      <div className="w-full flex flex-wrap justify-center gap-6 max-w-7xl">
        <button
          onClick={() => setDocumentModalOpen(true)}
        >
          <MenuContainer
            text="Adicionar Documento" color="bg-red-500" textColor="text-white"
          />
        </button>
        <a
          href="/invoices"
        >
          <MenuContainer text="Faturas" color="bg-blue-400" textColor="text-gray-900" />
        </a>
        <button
          onClick={() => setInvoiceModalOpen(true)}
        >
          <MenuContainer text="Adicionar Nova Fatura" color="bg-yellow-400" textColor="text-gray-900" />
        </button>
      </div>

      {/* Lembretes */}
      <Reminders items={reminders} />

      {/* Modais */}
      <AddDocumentModal
        isOpen={documentModalOpen}
        onClose={() => setDocumentModalOpen(false)}
        onSave={handleSaveDocument}
        invoices={invoices}
        accounts={accounts}
      />

      <AddInvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
      />
    </div>
  )
}

export default App
