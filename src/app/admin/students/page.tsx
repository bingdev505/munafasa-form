"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
import { addStudent, addMultipleStudents } from "@/app/actions/add-student";
import { getAttendance, AttendanceWithRegistration } from "@/app/actions/get-attendance";
import { deleteAttendance } from "@/app/actions/delete-attendance";

const CLASSES = [
  "Muthavaal Avval",
  "Muthavval Sani",
  "Thakassus Fiqh",
  "Thakassus Adab",
  "Mukhthasar",
  "7th Class",
];

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<AttendanceWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // Single student form
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentClass, setNewStudentClass] = useState("");

  // Bulk add form
  const [bulkNames, setBulkNames] = useState("");
  const [bulkClass, setBulkClass] = useState("");

  // Filter
  const [filterClass, setFilterClass] = useState("all");

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await getAttendance();
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error });
    } else {
      setStudents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async () => {
    if (!newStudentName.trim() || !newStudentClass) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter name and select class.",
      });
      return;
    }

    setIsAdding(true);
    const result = await addStudent({
      name: newStudentName.trim(),
      class: newStudentClass,
    });

    if (result.success) {
      toast({ title: "Success", description: result.message });
      setNewStudentName("");
      setNewStudentClass("");
      fetchStudents();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsAdding(false);
  };

  const handleBulkAdd = async () => {
    if (!bulkNames.trim() || !bulkClass) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter names and select class.",
      });
      return;
    }

    const names = bulkNames
      .split("\n")
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    if (names.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No valid names found.",
      });
      return;
    }

    setIsBulkAdding(true);
    const studentsToAdd = names.map((name) => ({
      name,
      class: bulkClass,
    }));

    const result = await addMultipleStudents(studentsToAdd);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      setBulkNames("");
      setBulkClass("");
      fetchStudents();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
    setIsBulkAdding(false);
  };

  const handleDelete = async (id: number) => {
    const result = await deleteAttendance(id);
    if (result.success) {
      toast({ title: "Success", description: "Student deleted successfully." });
      fetchStudents();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const filteredStudents = filterClass === "all" 
    ? students 
    : students.filter((s) => s.class === filterClass);

  const classCounts = CLASSES.map((cls) => ({
    name: cls,
    count: students.filter((s) => s.class === cls).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">Add and manage students for meeting attendance</p>
        </div>
      </div>

      {/* Class Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {classCounts.map((cls) => (
          <Card key={cls.name} className="cursor-pointer hover:bg-muted/50" onClick={() => setFilterClass(cls.name)}>
            <CardHeader className="pb-2">
              <CardDescription>{cls.name}</CardDescription>
              <CardTitle className="text-3xl">{cls.count}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Add Student Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Add Single Student */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Single Student
            </CardTitle>
            <CardDescription>Add one student at a time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                placeholder="Enter student name"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentClass">Class</Label>
              <Select value={newStudentClass} onValueChange={setNewStudentClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddStudent} disabled={isAdding} className="w-full">
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Student"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Add Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Add Students
            </CardTitle>
            <CardDescription>Add multiple students at once (one name per line)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bulkNames">Student Names (one per line)</Label>
              <textarea
                id="bulkNames"
                className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Ahmad&#10;Mohammed&#10;Ali&#10;Hassan"
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulkClass">Class for All</Label>
              <Select value={bulkClass} onValueChange={setBulkClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleBulkAdd} disabled={isBulkAdding} className="w-full">
              {isBulkAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                `Add Students (${bulkNames.split("\n").filter((n) => n.trim()).length})`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>All Students ({filteredStudents.length})</CardTitle>
              <CardDescription>List of all registered students</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {CLASSES.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-center">Submitted</TableHead>
                    <TableHead className="w-20 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.id}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell className="text-center">
                          {student.when_reach ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              {student.when_reach}
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              Not yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{student.name}" from the list.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(student.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                        No students found. Add some students above.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
