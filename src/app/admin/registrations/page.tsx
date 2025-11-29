
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllFamilyData, FullFamilyData, FamilyMember } from "@/app/actions/get-all-family-data";
import { deleteFamilyRegistration } from "@/app/actions/delete-family-registration";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Users, Edit, Trash2, Settings2, UserPlus, UserCheck } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Helper to format column keys into readable names
const formatColumnName = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ALL_COLUMNS = {
  student_name: "Student Name",
  student_class: "Student Class",
  father_name: "Father's Name",
  mother_name: "Mother's Name",
  grandfather_name: "Grandfather's Name",
  grandmother_name: "Grandmother's Name",
  brother_name: "Brother's Name",
  sister_name: "Sister's Name",
  others: "Other Members",
};

type ColumnKeys = keyof typeof ALL_COLUMNS;

export default function RegistrationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [allStudentData, setAllStudentData] = useState<FullFamilyData[]>([]);
  const [filteredData, setFilteredData] = useState<FullFamilyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [registrationFilter, setRegistrationFilter] = useState("all");
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
    others: true,
  });

  const fetchRegistrations = async () => {
    setLoading(true);
    const { data, error } = await getAllFamilyData();
    if (error) {
      setError(error);
    } else {
      setAllStudentData(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const { uniqueClasses, classCounts, totalRegistered, totalUnregistered } = useMemo(() => {
    const classes = new Set<string>();
    const counts: { [key: string]: number } = {};
    let registered = 0;
    
    allStudentData.forEach(r => {
        if(r.student_class) {
            classes.add(r.student_class);
        }
        if (r.isRegistered) {
          registered++;
          if (r.student_class) {
            counts[r.student_class] = (counts[r.student_class] || 0) + 1;
          }
        }
    });

    return {
        uniqueClasses: ["all", ...Array.from(classes).sort()],
        classCounts: counts,
        totalRegistered: registered,
        totalUnregistered: allStudentData.length - registered
    };
  }, [allStudentData]);
  
  useEffect(() => {
    let filtered = allStudentData;

    if (registrationFilter !== 'all') {
      const isRegistered = registrationFilter === 'registered';
      filtered = filtered.filter(entry => entry.isRegistered === isRegistered);
    }

    if (classFilter !== 'all') {
        filtered = filtered.filter(entry => entry.student_class === classFilter);
    }

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => 
        Object.values(entry).some(value =>
          String(value).toLowerCase().includes(lowercasedFilter)
        ) || (entry.others && entry.others.some(o => o.name.toLowerCase().includes(lowercasedFilter) || o.relationship.toLowerCase().includes(lowercasedFilter)))
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, classFilter, registrationFilter, allStudentData]);

  const downloadCSV = () => {
    const dataToExport = filteredData.map(r => {
        const baseData: {[key: string]: any} = {
            "Student ID": r.student_id,
            "Student Name": r.student_name,
            "Class": r.student_class,
            "Registered": r.isRegistered ? "Yes" : "No",
            "Father's Name": r.father_name,
            "Mother's Name": r.mother_name,
            "Grandfather's Name": r.grandfather_name,
            "Grandmother's Name": r.grandmother_name,
            "Brother's Name": r.brother_name,
            "Sister's Name": r.sister_name,
            "Registered At": r.isRegistered ? new Date(r.created_at).toLocaleString() : "",
        };
        (r.others || []).forEach(o => {
            baseData[o.relationship] = o.name;
        });
        return baseData;
    });

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

  const handleEdit = (studentId: string) => {
    router.push(`/registration?student_id=${studentId}`);
  };

  const handleDelete = async (id: number) => {
    const result = await deleteFamilyRegistration(id);
    if (result.success) {
      fetchRegistrations(); // Refetch data to update the table
      toast({ title: "Success", description: "Registration deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Delete Failed", description: result.message });
    }
  };

  const visibleColumnKeys = Object.entries(visibleColumns)
    .filter(([, isVisible]) => isVisible)
    .map(([key]) => key as ColumnKeys);
  
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
        <SummaryCard title="Total Students" value={allStudentData.length} />
        <SummaryCard title="Registered" value={totalRegistered} icon={<UserCheck className="h-4 w-4 text-muted-foreground" />} />
        <SummaryCard title="Not Registered" value={totalUnregistered} icon={<UserPlus className="h-4 w-4 text-muted-foreground" />} />
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
            placeholder="Search all fields..."
            className="w-full md:max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={registrationFilter} onValueChange={setRegistrationFilter}>
                <SelectTrigger className="w-full md:max-w-xs">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                    <SelectItem value="not-registered">Not Registered</SelectItem>
                </SelectContent>
            </Select>
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
            {registrationFilter !== 'not-registered' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {Object.entries(ALL_COLUMNS).map(([key, name]) => (
                    <DropdownMenuCheckboxItem
                      key={key}
                      className="capitalize"
                      checked={visibleColumns[key as ColumnKeys]}
                      onCheckedChange={(value) =>
                        setVisibleColumns((prev) => ({
                          ...prev,
                          [key]: !!value,
                        }))
                      }
                    >
                      {name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
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
                <TableHead>S.No</TableHead>
                 {registrationFilter === 'not-registered' ? (
                    <>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Class</TableHead>
                    </>
                ) : (
                  visibleColumnKeys.map((key) => (
                    <TableHead key={key}>{ALL_COLUMNS[key]}</TableHead>
                  ))
                )}
              <TableHead className="text-center no-print">Full Details</TableHead>
              <TableHead className="text-center no-print">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((reg, index) => (
                <Collapsible asChild key={reg.student_id} className="group">
                  <React.Fragment>
                    <TableRow>
                        <TableCell>{index + 1}</TableCell>
                        {registrationFilter === 'not-registered' ? (
                          <>
                            <TableCell>{reg.student_name}</TableCell>
                            <TableCell>{reg.student_class}</TableCell>
                          </>
                        ) : (
                          visibleColumnKeys.map((key) => {
                            let value: React.ReactNode = "-";
                            if (key === 'others') {
                              if (reg.others && reg.others.length > 0) {
                                  value = (
                                    <ul className="list-inside">
                                      {reg.others.map((o, i) => o.name && o.relationship ? <li key={i}>{`${o.relationship}: ${o.name}`}</li>: null)}
                                    </ul>
                                  );
                              }
                            } else if (key in reg) {
                              const regValue = reg[key as keyof FullFamilyData];
                              value = (typeof regValue === 'string' || typeof regValue === 'number') ? regValue : null;
                            }
                            return <TableCell key={key}>{value || "-"}</TableCell>;
                          })
                        )}
                        <TableCell className="text-center no-print">
                          {reg.isRegistered ? (
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Users className="h-4 w-4 mr-2" />
                                View
                                <ChevronDown className="h-4 w-4 ml-2 transition-transform group-data-[state=open]:rotate-180" />
                              </Button>
                            </CollapsibleTrigger>
                          ) : (
                            <Badge variant="outline">Not Registered</Badge>
                          )}
                        </TableCell>
                         <TableCell className="flex items-center justify-center space-x-1 no-print">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(reg.student_id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {reg.isRegistered && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the family registration record.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(reg.id)}>
                                    Continue
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </TableCell>
                      </TableRow>
                      {reg.isRegistered && (
                        <CollapsibleContent asChild>
                            <TableRow className="no-print bg-gray-50 dark:bg-gray-800/50">
                              <TableCell colSpan={visibleColumnKeys.length + 3}>
                                  <div className="p-4">
                                      <h4 className="font-semibold mb-2 text-base">Full Family Details:</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                                          <div><strong>Student:</strong> {reg.student_name} ({reg.student_class})</div>
                                          <div><strong>Father:</strong> {reg.father_name || "-"}</div>
                                          <div><strong>Mother:</strong> {reg.mother_name || "-"}</div>
                                          <div><strong>Grandfather:</strong> {reg.grandfather_name || "-"}</div>
                                          <div><strong>Grandmother:</strong> {reg.grandmother_name || "-"}</div>
                                          <div><strong>Brother:</strong> {reg.brother_name || "-"}</div>
                                          <div><strong>Sister:</strong> {reg.sister_name || "-"}</div>
                                      </div>
                                      {reg.others && reg.others.length > 0 && reg.others.some(m => m.name) && (
                                          <div className="mt-4">
                                              <h5 className="font-semibold mb-1">Other Members:</h5>
                                              <ul className="list-disc list-inside space-y-1 text-sm">
                                                  {reg.others.map((member, index) => (
                                                      member.name && member.relationship ? (
                                                      <li key={index}>
                                                          <span className="font-semibold">{member.relationship}:</span> {member.name}
                                                      </li>
                                                      ) : null
                                                  ))}
                                              </ul>
                                          </div>
                                      )}
                                  </div>
                              </TableCell>
                            </TableRow>
                        </CollapsibleContent>
                      )}
                  </React.Fragment>
                </Collapsible>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumnKeys.length + 3} className="text-center h-24">
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

    