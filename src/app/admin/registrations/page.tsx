
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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Users, ListFilter } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ColumnKeys = 'student_name' | 'student_class' | 'father_name' | 'mother_name' | 'grandfather_name' | 'grandmother_name' | 'brother_name' | 'sister_name' | 'registered_at';

const columnDisplayNames: Record<ColumnKeys, string> = {
  student_name: 'Student Name',
  student_class: 'Class',
  father_name: "Father's Name",
  mother_name: "Mother's Name",
  grandfather_name: "Grandfather's Name",
  grandmother_name: "Grandmother's Name",
  brother_name: "Brother's Name",
  sister_name: "Sister's Name",
  registered_at: 'Registered At',
};

export default function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<FullFamilyData[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<FullFamilyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKeys, boolean>>({
    student_name: true,
    student_class: true,
    father_name: true,
    mother_name: true,
    grandfather_name: false,
    grandmother_name: false,
    brother_name: false,
    sister_name: false,
    registered_at: true,
  });

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

  const { uniqueClasses, classCounts } = useMemo(() => {
    const classes = new Set<string>();
    const counts: { [key: string]: number } = {};
    
    registrations.forEach(r => {
        if(r.student_class) {
            classes.add(r.student_class);
            counts[r.student_class] = (counts[r.student_class] || 0) + 1;
        }
    });

    return {
        uniqueClasses: ["all", ...Array.from(classes).sort()],
        classCounts: counts
    };
  }, [registrations]);
  
  useEffect(() => {
    let filtered = registrations;

    if (classFilter !== 'all') {
        filtered = filtered.filter(entry => entry.student_class === classFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter((entry) => {
        const lowercasedFilter = searchTerm.toLowerCase();
        return (
          entry.student_name?.toLowerCase().includes(lowercasedFilter) ||
          entry.student_class?.toLowerCase().includes(lowercasedFilter) ||
          entry.father_name?.toLowerCase().includes(lowercasedFilter) ||
          entry.mother_name?.toLowerCase().includes(lowercasedFilter)
        );
      });
    }

    setFilteredRegistrations(filtered);
  }, [searchTerm, classFilter, registrations]);

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
  
  const handlePrint = () => {
    window.print();
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full max-w-xs" />
        <Skeleton className="h-28 w-full" />
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <Skeleton className="h-10 w-full md:w-64" />
            <div className="flex gap-2 w-full md:w-auto">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 no-print">
        <SummaryCard title="Total Registrations" value={registrations.length} />
      </div>

       <Card className="no-print">
        <CardHeader>
          <CardTitle className="text-lg">Registrations by Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {Object.entries(classCounts).sort(([a], [b]) => a.localeCompare(b)).map(([className, count]) => (
              <div key={className} className="flex items-center space-x-2 text-sm">
                <span className="font-semibold">{className}:</span>
                <span className="font-mono text-blue-600 font-bold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="flex flex-col sm:flex-row w-full gap-4">
            <Input
            type="text"
            placeholder="Search name, class, parents..."
            className="w-full md:max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full md:max-w-xs">
                    <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                    {uniqueClasses.map(c => (
                        <SelectItem key={c} value={c}>
                            {c === 'all' ? 'All Classes' : c}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Columns
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.keys(visibleColumns).map((key) => (
                        <DropdownMenuCheckboxItem
                            key={key}
                            className="capitalize"
                            checked={visibleColumns[key as ColumnKeys]}
                            onCheckedChange={(value) =>
                                setVisibleColumns({
                                ...visibleColumns,
                                [key]: !!value,
                                })
                            }
                        >
                            {columnDisplayNames[key as ColumnKeys]}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            <Button
            onClick={downloadCSV}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold whitespace-nowrap"
            >
            Download CSV
            </Button>
            <Button
              onClick={handlePrint}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-700 text-white font-bold whitespace-nowrap"
            >
              Print
            </Button>
        </div>
      </div>

      <div className="rounded-md border mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
                {Object.entries(visibleColumns).map(([key, isVisible]) => 
                    isVisible && <TableHead key={key}>{columnDisplayNames[key as ColumnKeys]}</TableHead>
                )}
              <TableHead className="text-center no-print">Full Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg) => (
                <Collapsible key={reg.id} asChild>
                  <>
                    <TableRow>
                        {Object.entries(visibleColumns).map(([key, isVisible]) => {
                            if (!isVisible) return null;
                            const value = reg[key as keyof FullFamilyData];
                            if (key === 'registered_at') {
                                return <TableCell key={key}>{new Date(value as string).toLocaleString()}</TableCell>
                            }
                            return <TableCell key={key}>{(value as string) || "-"}</TableCell>
                        })}
                      <TableCell className="text-center no-print">
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
                      <TableRow className="no-print">
                        <TableCell colSpan={Object.values(visibleColumns).filter(v => v).length + 1} className="p-0">
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
                <TableCell colSpan={Object.values(visibleColumns).filter(v => v).length + 1} className="text-center h-24">
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
