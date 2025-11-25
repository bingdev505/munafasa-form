import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md text-center">
            <CardHeader className="items-center">
                <div className="p-3 rounded-full bg-success">
                    <CheckCircle2 className="h-12 w-12 text-success-foreground" />
                </div>
                <CardTitle className="mt-4 text-2xl">Submission Received!</CardTitle>
                <CardDescription>Thank you for your response. It has been recorded successfully.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild>
                    <Link href="/">Create your own form</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
