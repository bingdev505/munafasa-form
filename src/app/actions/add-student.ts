"use server";

import { z } from "zod";
import { supabase } from "@/utils/supabaseClient";

const StudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class: z.string().min(1, "Class is required"),
});

export async function addStudent(data: { name: string; class: string }) {
  const parsedData = StudentSchema.safeParse(data);

  if (!parsedData.success) {
    return {
      success: false,
      message: "Invalid data provided.",
    };
  }

  const { name, class: className } = parsedData.data;

  try {
    const { error } = await supabase
      .from("attendance")
      .insert({ name, class: className });

    if (error) {
      console.error("Error adding student:", error);
      return {
        success: false,
        message: `Failed to add student: ${error.message}`,
      };
    }

    return { success: true, message: "Student added successfully!" };
  } catch (error) {
    console.error("Error adding student:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}

export async function addMultipleStudents(students: { name: string; class: string }[]) {
  try {
    const { error } = await supabase
      .from("attendance")
      .insert(students);

    if (error) {
      console.error("Error adding students:", error);
      return {
        success: false,
        message: `Failed to add students: ${error.message}`,
      };
    }

    return { success: true, message: `${students.length} students added successfully!` };
  } catch (error) {
    console.error("Error adding students:", error);
    return { success: false, message: "An unexpected error occurred." };
  }
}
