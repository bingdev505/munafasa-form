"use server";

import { supabase } from "@/utils/supabaseClient";

export type ClassData = {
  [className: string]: { id: string; name: string }[];
};

export async function getClassData(): Promise<ClassData> {
  const { data, error } = await supabase
    .from("attendance")
    .select("id, class, name");

  if (error) {
    console.error("Error fetching class data:", error);
    return {};
  }

  if (!data) {
    return {};
  }

  // Process data into a structured object
  const classData: ClassData = data.reduce((acc, item) => {
    const { class: className, name, id } = item;

    if (!acc[className]) {
      acc[className] = [];
    }
    
    // Ensure no duplicate students are added
    if (!acc[className].some(student => student.id === id)) {
      acc[className].push({ id, name });
    }

    return acc;
  }, {} as ClassData);

  return classData;
}
