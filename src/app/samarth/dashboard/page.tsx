
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from 'next/link';


export default function DashboardPage() {
  return (
    <div className="grid gap-6">
      <Alert className="bg-primary text-primary-foreground border-primary">
          <AlertTitle className="font-bold text-lg">Announcement:</AlertTitle>
          <AlertDescription>
            <Link href="#" className="underline hover:text-primary-foreground/80">
              Create/Link Your Academic Bank of Credits (ABC) Account
            </Link>
          </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-6">
            <h3 className="text-lg font-semibold">ODL36914 : MASTER OF BUSINESS ADMINISTRATION (FINANCE)</h3>
            <Button variant="outline" className="mt-4">
                CLICK HERE
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
