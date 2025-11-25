"use server";

import { supabase } from "@/utils/supabaseClient";

export type Student = { 
  id: string; 
  name: string; 
  male?: number | null; 
  female?: number | null; 
  when_reach?: string | null;
};

export type ClassData = {
  [className: string]: Student[];
};

export async function getClassData(): Promise<ClassData> {
  // Fetch all columns to check submission status
  const { data, error } = await supabase
    .from("attendance")
    .select("id, class, name, male, female, when_reach");

  if (error) {
    console.error("Error fetching class data:", error);
    return {};
  }

  if (!data) {
    return {};
  }

  // Process data into a structured object
  const classData: ClassData = data.reduce((acc, item) => {
    const { class: className, name, id, male, female, when_reach } = item;

    if (!acc[className]) {
      acc[className] = [];
    }
    
    // Ensure no duplicate students are added
    if (!acc[className].some(student => student.id === id)) {
      acc[className].push({ id, name, male, female, when_reach });
    }

    return acc;
  }, {} as ClassData);

  return classData;
}
