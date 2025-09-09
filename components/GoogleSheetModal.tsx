// components/GoogleSheetModal.tsx

import React, { useState } from 'react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
}

const appsScriptCode = `
const SHEET_NAME = "Bookings";
const HEADERS = ["id", "studio", "date", "startTime", "endTime", "userName", "purpose", "subject"];

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error(\`Sheet named "\${SHEET_NAME}" not found.\`);
    }
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Get headers from the sheet itself
    const json = data.map(row => {
      let obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: json }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
     if (!sheet) {
      throw new Error(\`Sheet named "\${SHEET_NAME}" not found.\`);
    }
    
    const lock = LockService.getScriptLock();
    lock.waitLock(30000); // Wait up to 30 seconds for other processes to finish

    try {
        const body = JSON.parse(e.postData.contents);
        
        if (body.action === 'add') {
          return handleAdd(sheet, body.data);
        } else if (body.action === 'delete') {
          return handleDelete(sheet, body.data);
        } else {
          throw new Error("Invalid action specified.");
        }
    } finally {
        lock.releaseLock();
    }

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleAdd(sheet, bookingData) {
  const data = sheet.getDataRange().getValues();
  const headers = data.length > 0 ? data[0] : HEADERS;
  
  // Overlap check
  const dateIndex = headers.indexOf('date');
  const studioIndex = headers.indexOf('studio');
  const startTimeIndex = headers.indexOf('startTime');
  const endTimeIndex = headers.indexOf('endTime');

  const newStart = timeToMinutes(bookingData.startTime);
  const newEnd = timeToMinutes(bookingData.endTime);

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[dateIndex] === bookingData.date && row[studioIndex] === bookingData.studio) {
      const existingStart = timeToMinutes(row[startTimeIndex]);
      const existingEnd = timeToMinutes(row[endTimeIndex]);
      if (newStart < existingEnd && newEnd > existingStart) {
        throw new Error("This time slot overlaps with an existing booking in the sheet.");
      }
    }
  }
  
  const newId = new Date().getTime().toString() + "-" + Math.random().toString(36).substr(2, 9);
  const newBooking = { ...bookingData, id: newId };
  const newRow = headers.map(header => newBooking[header] || "");

  sheet.appendRow(newRow);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, data: newBooking }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleDelete(sheet, deleteData) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex = headers.indexOf('id');
  
  if (idIndex === -1) {
      throw new Error("Column 'id' not found in the sheet.");
  }

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][idIndex].toString() === deleteData.id.toString()) {
      sheet.deleteRow(i + 1);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: "Booking deleted." }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
  throw new Error("Booking ID not found.");
}

function timeToMinutes(timeStr) {
  if (typeof timeStr !== 'string' || !timeStr.includes(':')) return 0;
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}
`.trim();

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({ isOpen, onClose, onSave }) => {
    const [url, setUrl] = useState(localStorage.getItem('googleSheetWebAppUrl') || '');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(url);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-3xl mx-auto relative transform transition-all max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect to Google Sheets</h2>
                <p className="text-slate-500 mb-6">Follow the steps below to use Google Sheets as your database.</p>
                
                <div className="space-y-4 mb-6">
                    <label htmlFor="sheetUrl" className="block text-sm font-medium text-slate-700">Apps Script Deployment URL</label>
                    <input
                        id="sheetUrl"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Paste your deployment URL here"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-brand-secondary focus:border-brand-secondary bg-white text-slate-900 placeholder-slate-400"
                    />
                </div>

                <details className="bg-slate-50 rounded-lg p-4 border">
                    <summary className="font-semibold text-slate-700 cursor-pointer">View Setup Instructions</summary>
                    <div className="prose prose-sm max-w-none mt-4 text-slate-600">
                        <ol className="list-decimal pl-5 space-y-3">
                            <li>
                                <strong>Create a Google Sheet:</strong>
                                Go to <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-brand-secondary">sheets.new</a>. Name the sheet file whatever you like.
                            </li>
                            <li>
                                <strong>Set up Headers:</strong>
                                In the sheet at the bottom, rename "Sheet1" to "Bookings". In the first row (row 1), paste these exact headers into cells A1, B1, C1, and so on:
                                <code className="block bg-slate-200 p-2 rounded-md mt-1 text-xs">id,studio,date,startTime,endTime,userName,purpose,subject</code>
                            </li>
                            <li>
                                <strong>Open Apps Script:</strong>
                                In the menu, go to <em>Extensions &gt; Apps Script</em>.
                            </li>
                            <li>
                                <strong>Paste the Code:</strong>
                                Delete any existing code and paste the entire script below into the editor. Save the project.
                                <pre className="bg-slate-800 text-white p-3 rounded-md mt-1 text-xs overflow-x-auto">
                                    <code>{appsScriptCode}</code>
                                </pre>
                            </li>
                            <li>
                                <strong>Deploy the Script:</strong>
                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                    <li>Click the blue <strong>Deploy</strong> button, then <strong>New deployment</strong>.</li>
                                    <li>Click the gear icon next to "Select type" and choose <strong>Web app</strong>.</li>
                                    <li>For "Who has access", select <strong>Anyone</strong>. This is important!</li>
                                    <li>Click <strong>Deploy</strong>.</li>
                                    <li>Click <strong>Authorize access</strong> and follow the prompts to allow the script to manage your sheet. You may see a safety warning; click "Advanced" and "Go to ... (unsafe)" to proceed.</li>
                                </ul>
                            </li>
                            <li>
                                <strong>Copy the URL:</strong>
                                After deploying, copy the <strong>Web app URL</strong>.
                            </li>
                            <li>
                                <strong>Save in this App:</strong>
                                Paste the URL into the input field above and click "Save".
                            </li>
                        </ol>
                    </div>
                </details>

                <div className="flex justify-end space-x-3 pt-6">
                    <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-dark rounded-lg transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};