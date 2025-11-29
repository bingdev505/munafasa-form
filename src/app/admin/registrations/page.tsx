
"use client";

import { useEffect, useState, useMemo } from "react";
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
import { ChevronDown, Users, Edit, Trash2 } from "lucide-react";
import SummaryCard from "@/components/SummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Helper to format column keys into readable names
const formatColumnName = (key: string) => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function RegistrationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<FullFamilyData[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<FullFamilyData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
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
  
  const dynamicColumns = useMemo(() => {
    const standardColumns: (keyof Omit<FullFamilyData, 'id' | 'student_id' | 'created_at' | 'others'>)[] = [
      'student_name',
      'student_class',
      'father_name',
      'mother_name',
      'grandfather_name',
      'grandmother_name',
      'brother_name',
      'sister_name',
    ];

    const activeColumns = new Set<string>(['student_name', 'student_class']);
    const customRelationshipKeys = new Set<string>();

    for (const reg of filteredRegistrations) {
      // Check standard columns
      for (const col of standardColumns) {
        if (reg[col]) {
          activeColumns.add(col);
        }
      }
      // Check for custom relationships
      if (reg.others) {
        for (const other of reg.others) {
          if (other.relationship) {
            customRelationshipKeys.add(other.relationship);
          }
        }
      }
    }
    
    // Ordered standard columns
    const orderedStandardColumns = standardColumns.filter(col => activeColumns.has(col));
    
    return [...orderedStandardColumns, ...Array.from(customRelationshipKeys).sort()];
  }, [filteredRegistrations]);
  
  useEffect(() => {
    let filtered = registrations;

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

    setFilteredRegistrations(filtered);
  }, [searchTerm, classFilter, registrations]);

  const downloadCSV = () => {
    const dataToExport = filteredRegistrations.map(r => {
        const baseData: {[key: string]: any} = {
            "Student ID": r.student_id,
            "Student Name": r.student_name,
            "Class": r.student_class,
            "Father's Name": r.father_name,
            "Mother's Name": r.mother_name,
            "Grandfather's Name": r.grandfather_name,
            "Grandmother's Name": r.grandmother_name,
            "Brother's Name": r.brother_name,
            "Sister's Name": r.sister_name,
            "Registered At": new Date(r.created_at).toLocaleString(),
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
            placeholder="Search all fields..."
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
                {dynamicColumns.map((key) => (
                  <TableHead key={key}>{formatColumnName(key)}</TableHead>
                ))}
              <TableHead className="text-center no-print">Full Details</TableHead>
              <TableHead className="text-center no-print">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map((reg, index) => (
                <Collapsible asChild key={reg.id}>
                  <>
                    <TableRow>
                      <TableCell>{index + 1}</TableCell>
                      {dynamicColumns.map((key) => {
                        let value: React.ReactNode = "-";
                        if (key in reg) {
                          value = reg[key as keyof FullFamilyData] as string | number | null;
                        } else {
                          // It's a custom relationship
                          const otherMember = reg.others?.find(o => o.relationship === key);
                          if (otherMember) {
                            value = otherMember.name;
                          }
                        }
                        return <TableCell key={key}>{value || "-"}</TableCell>;
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
                       <TableCell className="flex items-center justify-center space-x-1 no-print">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(reg.student_id)}>
                          <Edit className="h-4 w-4" />
                        </Button>
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
                      </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                      <TableRow className="no-print">
                        <TableCell colSpan={dynamicColumns.length + 3} className="p-0">
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
                <TableCell colSpan={dynamicColumns.length + 3} className="text-center h-24">
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

    