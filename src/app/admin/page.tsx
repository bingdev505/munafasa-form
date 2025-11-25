"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getAttendance } from "@/app/actions/get-attendance";
import { saveImportedAttendance } from "@/app/actions/save-attendance";
import { updateAttendance } from "@/app/actions/update-attendance";
import { deleteAttendance } from "@/app/actions/delete-attendance";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Attendance {
  id: number;
  name: string;
  male: number | null;
  female: number | null;
  when_reach: string | null;
  class: string;
  created_at: string;
}

const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
  male: z.coerce.number().optional(),
  female: z.coerce.number().optional(),
  when_reach: z.string().optional(),
});

type EditFormData = z.infer<typeof editFormSchema>;

export default function AdminPage() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<Attendance[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();

  const form = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
  });

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await getAttendance();
    if (error) {
      setError(error);
      toast({ variant: "destructive", title: "Error", description: error });
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
            name: row.Name || row.name || row.ID || row.id,
            class: row.Class || row.class,
          })).filter(item => item.name && item.class);

          if (importedData.length === 0) {
            setImportError("No valid data found in CSV file. Ensure columns are named 'Name' (or 'ID') and 'Class'.");
            setImporting(false);
            return;
          }

          const { success, error } = await saveImportedAttendance(importedData);
          if (success) {
            fetchAttendance();
            toast({ title: "Success", description: "Data imported successfully." });
          } else {
            setImportError(error);
            toast({ variant: "destructive", title: "Import Failed", description: error });
          }
          setImporting(false);
        },
        error: (error: any) => {
            setImportError("Error parsing CSV file: " + error.message);
            toast({ variant: "destructive", title: "Import Error", description: "Error parsing CSV file: " + error.message });
            setImporting(false);
        }
      });
    }
  };

  const handleEditSubmit = async (data: EditFormData, id: number) => {
    const result = await updateAttendance(id, data);
    if (result.success) {
      fetchAttendance();
      setIsEditDialogOpen(false); // Close the dialog on success
      toast({ title: "Success", description: "Record updated successfully." });
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: result.message });
    }
  };
  
  const handleDelete = async (id: number) => {
    const result = await deleteAttendance(id);
    if (result.success) {
      fetchAttendance();
      toast({ title: "Success", description: "Record deleted successfully." });
    } else {
      toast({ variant: "destructive", title: "Delete Failed", description: result.message });
    }
  };
  
  const openEditDialog = (entry: Attendance) => {
    form.reset({
      name: entry.name,
      class: entry.class,
      male: entry.male || 0,
      female: entry.female || 0,
      when_reach: entry.when_reach || "",
    });
    setIsEditDialogOpen(true);
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <Skeleton className="h-10 w-full md:w-64" />
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <Skeleton className="h-10 w-full sm:w-32" />
            <Skeleton className="h-10 w-full sm:w-40" />
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
                <TableHead><Skeleton className="h-5 w-24" /></TableHead>
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
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <Input
          type="text"
          placeholder="Filter by name..."
          className="w-full md:max-w-sm"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
          <label htmlFor="import-csv" className="w-full sm:w-auto text-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
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
          <Button
            onClick={downloadCSV}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-white font-bold"
          >
            Download as CSV
          </Button>
        </div>
      </div>
      {importing && <p className="text-blue-500">Importing data, please wait...</p>}
      {importError && <p className="text-red-500">{importError}</p>}

      <div className="rounded-md border mt-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead className="text-center">Male</TableHead>
              <TableHead className="text-center">Female</TableHead>
              <TableHead>When Reach</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.id}</TableCell>
                <TableCell>{entry.name}</TableCell>
                <TableCell>{entry.class}</TableCell>
                <TableCell className="text-center">{entry.male}</TableCell>
                <TableCell className="text-center">{entry.female}</TableCell>
                <TableCell>{entry.when_reach}</TableCell>
                <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                <TableCell className="flex items-center justify-center space-x-1">
                  <Dialog onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                     {isEditDialogOpen && (
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Record</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit(data => handleEditSubmit(data, entry.id))} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" {...form.register("name")} />
                                {form.formState.errors.name && <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="class">Class</Label>
                                <Input id="class" {...form.register("class")} />
                                {form.formState.errors.class && <p className="text-red-500 text-sm">{form.formState.errors.class.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="male">Males</Label>
                                <Input id="male" type="number" {...form.register("male")} />
                            </div>
                            <div>
                                <Label htmlFor="female">Females</Label>
                                <Input id="female" type="number" {...form.register("female")} />
                            </div>
                            <div>
                                <Label htmlFor="when_reach">When Reach</Label>
                                <Input id="when_reach" {...form.register("when_reach")} />
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                     )}
                  </Dialog>

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
                          This action cannot be undone. This will permanently delete the attendance record.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(entry.id)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
