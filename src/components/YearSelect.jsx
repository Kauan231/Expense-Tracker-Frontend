import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function YearSelect({ invoices, selectedYear, setSelectedYear }) {
  const [yearOptions, setYearOptions] = useState([]);

  useEffect(() => {
    if (!invoices || invoices.length === 0) return;

    // Extract unique years from invoice dates
    const yearsSet = new Set(
      invoices.map(inv => new Date(inv.date).getFullYear())
    );

    const sortedYears = Array.from(yearsSet).sort((a, b) => b - a); // descending
    setYearOptions(sortedYears.map(y => ({ value: y, label: y })));
  }, [invoices]);

  return (
    <Select
      options={yearOptions}
      value={yearOptions.find(y => y.value === selectedYear) || null}
      onChange={(option) => setSelectedYear(option?.value || null)}
      placeholder="Selecione o ano"
      isClearable
    />
  );
}
