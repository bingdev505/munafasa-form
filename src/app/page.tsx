import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl">Dashboard</h1>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/forms/create">
            <PlusCircle className="h-4 w-4" />
            Create Form
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full flex flex-col items-center justify-center p-12 text-center border-dashed">
            <CardHeader>
              <CardTitle>No Forms Yet</CardTitle>
              <CardDescription>
                Get started by creating your first form.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/forms/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Your First Form
                </Link>
              </Button>
            </CardContent>
          </Card>
      </div>
    </main>
  );
}
