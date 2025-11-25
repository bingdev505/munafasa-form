import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
            <CardHeader className="items-center">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="h-12 w-12" />
                </div>
                <CardTitle className="mt-4 text-2xl">Thank You!</CardTitle>
                <CardDescription>Your attendance has been recorded.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Back to Home</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
