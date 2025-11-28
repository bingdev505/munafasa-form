
"use client";

import { useEffect, useState, useMemo } from "react";
import { getAllFamilyData, FullFamilyData } from "@/app/actions/get-all-family-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Papa from "papaparse";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Users } from "lucide-react";

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<FullFamilyData[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<FullFamilyData[]>([]);
  const [nameFilter, setNameFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await getAllFamilyData();
    if (error) {
      setError(error);
    } else {
      setRegistrations(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    let filtered = registrations;

    if (nameFilter) {
      filtered = filtered.filter((entry) =>
        entry.student_name?.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    setFilteredRegistrations(filtered);
  }, [nameFilter, registrations]);

  const downloadCSV = () => {
    const dataToExport = filteredRegistrations.map(r => ({
      "Student ID": r.student_id,
      "Student Name": r.student_name,
      "Class": r.student_class,
      "Father's Name": r.father_name,
      "Mother's Name": r.mother_name,
      "Grandfather's Name": r.grandfather_name,
      "Grandmother's Name": r.grandmother_name,
      "Brother's Name": r.brother_name,
      "Sister's Name": r.sister_name,
      "Other Members": (r.others || []).map(o => `${o.relationship}: ${o.name}`).join('; '),
      "Registered At": new Date(r.created_at).toLocaleString(),
    }));

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "registrations.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: 6 }).map((_, i) => (
                    <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                   ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Input
          type="text"
          placeholder="Filter by student name..."
          className="w-full md:max-w-sm"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Button
          onClick={downloadCSV}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold"
        >
          Download as CSV
        </Button>
      </div>

      <div className="rounded-md border mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Father</TableHead>
              <TableHead>Mother</TableHead>
              <TableHead>Registered At</TableHead>
              <TableHead className="text-center">Family</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg) => (
                <Collapsible asChild key={reg.id}>
                  <>
                    <TableRow>
                      <TableCell className="font-medium">{reg.student_name}</TableCell>
                      <TableCell>{reg.student_class}</TableCell>
                      <TableCell>{reg.father_name || "-"}</TableCell>
                      <TableCell>{reg.mother_name || "-"}</TableCell>
                      <TableCell>{new Date(reg.created_at).toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            View
                            <ChevronDown className="h-4 w-4 ml-2" />
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={6} className="p-0">
                            <div className="p-4 bg-gray-100 dark:bg-gray-800">
                                <h4 className="font-semibold mb-2">Full Family Details:</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                    <div><strong>Student:</strong> {reg.student_name} ({reg.student_class})</div>
                                    <div><strong>Father:</strong> {reg.father_name || "-"}</div>
                                    <div><strong>Mother:</strong> {reg.mother_name || "-"}</div>
                                    <div><strong>Grandfather:</strong> {reg.grandfather_name || "-"}</div>
                                    <div><strong>Grandmother:</strong> {reg.grandmother_name || "-"}</div>
                                    <div><strong>Brother:</strong> {reg.brother_name || "-"}</div>
                                    <div><strong>Sister:</strong> {reg.sister_name || "-"}</div>
                                </div>
                                {reg.others && reg.others.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="font-semibold mb-1">Other Members:</h5>
                                        <ul className="list-disc list-inside space-y-1">
                                            {reg.others.map((member, index) => (
                                                <li key={index}>
                                                    <span className="font-semibold">{member.relationship}:</span> {member.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  No registration records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
