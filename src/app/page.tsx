
"use client";

import { useState } from "react";
import { saveAttendance } from "@/app/actions/save-attendance";

export default function AttendancePage() {
  const [name, setName] = useState("");
  const [male, setMale] = useState(0);
  const [female, setFemale] = useState(0);
  const [whenReach, setWhenReach] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("male", String(male));
    formData.append("female", String(female));
    formData.append("when_reach", whenReach);

    const result = await saveAttendance(formData);

    if (result.success) {
      setMessage("Attendance saved successfully!");
      // Clear the form
      setName("");
      setMale(0);
      setFemale(0);
      setWhenReach("");
    } else {
      setMessage(`Error: ${result.error}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <h1 className="text-2xl font-bold mb-6 text-center">
            Meeting Attendance
          </h1>
          {message && <p className="mb-4 text-center">{message}</p>}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="male"
            >
              Number of Males
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="male"
              type="number"
              value={male}
              onChange={(e) => setMale(Number(e.target.value))}
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="female"
            >
              Number of Females
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="female"
              type="number"
              value={female}
              onChange={(e) => setFemale(Number(e.target.value))}
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="when_reach"
            >
              When will you reach?
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="when_reach"
              type="time"
              value={whenReach}
              onChange={(e) => setWhenReach(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-center">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Submit Attendance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
