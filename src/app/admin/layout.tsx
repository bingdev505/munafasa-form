import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow">
        <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
