
"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { getAttendance } from "@/app/actions/get-attendance";
import { saveImportedAttendance } from "@/app/actions/save-attendance";
import Papa from "papaparse";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

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
    setLoading(true);
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
        skipEmptyLines: true,
        complete: async (results) => {
          const importedData = results.data.map((row: any) => ({
            name: row.Name || row.name || row.ID || row.id, // Handles different possible headers for name
            class: row.Class || row.class,
          })).filter(item => item.name && item.class); // Filter out rows that are missing name or class

          if (importedData.length === 0) {
            setImportError("No valid data found in CSV file. Ensure columns are named 'Name' (or 'ID') and 'Class'.");
            setImporting(false);
            return;
          }

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
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead><Skeleton className="h-5 w-10" /></TableHead>
                <TableHead><Skeleton className="h-5 w-48" /></TableHead>
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
                <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                <TableHead><Skeleton className="h-5 w-16" /></TableHead>
                <TableHead><Skeleton className="h-5 w-32" /></TableHead>
                <TableHead><Skeleton className="h-5 w-40" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-full" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Records</h1>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Filter by name..."
          className="border p-2 rounded w-64"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <label htmlFor="import-csv" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Import CSV
          </label>
          <input
            id="import-csv"
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
            disabled={importing}
          />
          <button
            onClick={downloadCSV}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Download as CSV
          </button>
        </div>
      </div>
      {importing && <p className="text-blue-500">Importing data, please wait...</p>}
      {importError && <p className="text-red-500">{importError}</p>}

      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Male</TableHead>
              <TableHead className="text-center">Female</TableHead>
              <TableHead className="text-center">When Reach</TableHead>
              <TableHead className="text-center">Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium text-center">{entry.id}</TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.class}</TableCell>
                <TableCell className="text-center">{entry.male}</TableCell>
                <TableCell className="text-center">{entry.female}</TableCell>
                <TableCell className="text-center">{entry.when_reach}</TableCell>
                <TableCell className="text-center">{new Date(entry.created_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
