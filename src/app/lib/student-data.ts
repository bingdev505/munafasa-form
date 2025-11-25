
export type Student = {
    id: string;
    name: string;
    class: string;
};

export const classes = ["Mathematics", "Science", "History", "English"];

export const students: Student[] = [
    { id: "101", name: "John Doe", class: "Mathematics" },
    { id: "102", name: "Alice Johnson", class: "Mathematics" },
    { id: "201", name: "Jane Smith", class: "Science" },
    { id: "202", name: "Bob Brown", class: "Science" },
    { id: "301", name: "Peter Jones", class: "History" },
    { id: "302", name: "Charlie Davis", class: "History" },
    { id: "401", name: "Mary Williams", class: "English" },
    { id: "402", name: "Emily White", class: "English" },
];
