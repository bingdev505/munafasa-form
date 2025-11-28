
"use server";

import { supabase } from "@/utils/supabaseClient";

export type Student = { 
  id: string; 
  name: string; 
  male?: number | null; 
  female?: number | null; 
  when_reach?: string | null;
  isRegistered: boolean;
};

export type ClassData = {
  [className: string]: Student[];
};

export async function getClassData(): Promise<ClassData> {
  // Fetch all students from attendance
  const { data: attendanceData, error: attendanceError } = await supabase
    .from("attendance")
    .select("id, class, name, male, female, when_reach");

  if (attendanceError) {
    console.error("Error fetching class data:", attendanceError);
    return {};
  }

  if (!attendanceData) {
    return {};
  }
  
  // Fetch all registered student IDs from family
  const { data: familyData, error: familyError } = await supabase
    .from("family")
    .select("student_id");

  if (familyError) {
    console.error("Error fetching family data:", familyError);
    // Continue without registration data if it fails
  }

  const registeredStudentIds = new Set(familyData?.map(f => String(f.student_id)) || []);

  // Process data into a structured object
  const classData: ClassData = attendanceData.reduce((acc, item) => {
    const { class: className, name, id, male, female, when_reach } = item;

    if (!acc[className]) {
      acc[className] = [];
    }
    
    const studentIdStr = String(id);
    
    // Ensure no duplicate students are added
    if (!acc[className].some(student => student.id === studentIdStr)) {
      acc[className].push({ 
        id: studentIdStr, 
        name, 
        male, 
        female, 
        when_reach,
        isRegistered: registeredStudentIds.has(studentIdStr),
      });
    }

    return acc;
  }, {} as ClassData);

  return classData;
}
