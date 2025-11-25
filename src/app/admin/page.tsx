
"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getAttendance } from "@/app/actions/get-attendance";
import { saveImportedAttendance } from "@/app/actions/save-attendance";
import Papa from "papaparse";

interface Attendance {
  id: number;
  name: string;
  male: number;
  female: number;
  when_reach: string;
  class: string;
  created_at: string;
}

export default function AdminPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchAttendance = async () => {
    const { data, error } = await getAttendance();
    if (error) {
      setError(error);
    } else {
      setAttendance(data);
      setFilteredAttendance(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    setFilteredAttendance(
      attendance.filter((entry) =>
        entry.name.toLowerCase().includes(filter.toLowerCase())
      )
    );
  }, [filter, attendance]);

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Class", "Male", "Female", "When Reach", "Created At"];
    const rows = filteredAttendance.map((entry) =>
      [entry.id, entry.name, entry.class, entry.male, entry.female, entry.when_reach, entry.created_at].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "attendance.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImporting(true);
      setImportError(null);
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          const importedData = results.data.map((row: any) => ({
            name: row.name,
            class: row.class,
          }));
          const { success, error } = await saveImportedAttendance(importedData);
          if (success) {
            fetchAttendance(); // Refresh the data
          } else {
            setImportError(error);
          }
          setImporting(false);
        },
        error: (error: any) => {
            setImportError("Error parsing CSV file: " + error.message);
            setImporting(false);
        }
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Filter by name..."
          className="border p-2 rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex items-center">
          <label htmlFor="import-csv" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer mr-2">
            Import CSV
          </label>
          <input
            id="import-csv"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <button
            onClick={downloadCSV}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download as CSV
          </button>
        </div>
      </div>
      {importing && <p>Importing...</p>}
      {importError && <p className="text-red-500">{importError}</p>}

      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Class</th>
            <th className="py-2 px-4 border-b">Male</th>
            <th className="py-2 px-4 border-b">Female</th>
            <th className="py-2 px-4 border-b">When Reach</th>
            <th className="py-2 px-4 border-b">Created At</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttendance.map((entry) => (
            <tr key={entry.id}>
              <td className="py-2 px-4 border-b text-center">{entry.id}</td>
              <td className="py-2 px-4 border-b">{entry.name}</td>
              <td className="py-2 px-4 border-b">{entry.class}</td>
              <td className="py-2 px-4 border-b text-center">{entry.male}</td>
              <td className="py-2 px-4 border-b text-center">{entry.female}</td>
              <td className="py-2 px-4 border-b text-center">{entry.when_reach}</td>
              <td className="py-2 px-4 border-b text-center">{new Date(entry.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
