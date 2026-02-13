import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { SampleDataLoaderCard } from './SampleDataLoaderCard';

export function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          User roles are assigned during profile setup. Users authenticate via Internet Identity.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
          <CardDescription>Understanding user roles in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Admin</h3>
            <p className="text-sm text-muted-foreground">
              Full access to all features including catalog management, inventory, promotions, user management, and sensitive operations like voids and refunds.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Cashier</h3>
            <p className="text-sm text-muted-foreground">
              Access to POS operations, reports viewing, and basic transaction management. Cannot modify catalog, inventory, or perform administrative actions.
            </p>
          </div>
        </CardContent>
      </Card>

      <SampleDataLoaderCard />
    </div>
  );
}
