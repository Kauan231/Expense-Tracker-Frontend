export const URL = "http://localhost:3000"

export async function readAllInvoiceTrackerIds() {
    const skip = 0;
    const limit = 100;
    const res = await fetch(URL+`/invoiceTrackers?skip=${skip}&limit=${limit}`, {
        method: "GET"
    });
    let result = await res.json();
    return result.result;
}

export async function readAllInvoiceTracker(id, year, month) {
    let requestUrl = URL+`/invoiceTrackers/${id}?`;
    if(year != undefined) {
      requestUrl += `year=${year}`;
    }

    if(month != undefined) {
      requestUrl += `&month=${month}`;
    }

    const res = await fetch(requestUrl, {
        method: "GET"
    });
    let result = await res.json();
    return result.result;
}

export async function saveDocument(document) {
    const formData = new FormData();
    formData.append("type", document.type);
    formData.append("invoiceId", document.invoiceId);
    formData.append("cost", document.cost);
    formData.append("file", document.file);

    console.log("FormData sending...", [...formData.entries()]);

    const res = await fetch(URL+`/documents/create`, {
        method: "POST",
        body: formData
    });

    let result = await res.json();
    return result.result;
}

export async function saveInvoiceTracker(invoiceTracker) {
  const requestBody = {
    name: invoiceTracker.name,
    dueDate: invoiceTracker.dueDate
  };

  const res = await fetch(URL + `/invoiceTrackers/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const result = await res.json();
  return result.result;
}

export async function createInvoicePeriod(period) {
  const requestBody = {
    year: period.year,
    invoiceTrackerId: period.accountId
  };

  const res = await fetch(URL + `/invoices/createPeriod`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const result = await res.json();
  return result.result;
}


export async function readAllInvoices(year, month) {
    let requestUrl = URL+`/invoices?skip=0&limit=100`;
    if(year != undefined) {
      requestUrl += `&year=${year}`;
    }

    if(month != undefined) {
      requestUrl += `&month=${month}`;
    }

    const res = await fetch(requestUrl, {
        method: "GET"
    });
    let result = await res.json();
    return result.result;
}