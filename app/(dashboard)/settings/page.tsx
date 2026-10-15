import { getServerSession } from 'next-auth';
import { CheckCircle2 } from 'lucide-react';
import { authOptions } from '@/lib/authOptions';
import { PageHeader } from '@/components/layout/PageHeader';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { OrganizationSettings } from '@/components/settings/OrganizationSettings';
import { TwoFactorSettings } from '@/components/settings/TwoFactorSettings';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { titleCase } from '@/lib/format';

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || '—'}</span>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Your account, appearance and security."
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>The details tied to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Detail label="Name" value={user?.name} />
              <Detail label="Email" value={user?.email} />
              <Detail label="Role" value={user?.role ? titleCase(user.role) : undefined} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Choose how QuickSet looks to you.</CardDescription>
            </CardHeader>
            <CardContent>
              <AppearanceSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Security</CardTitle>
              <CardDescription>
                Keep your account locked down.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-xs text-muted-foreground">
                    Stored as a salted scrypt hash.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" /> Set
                </span>
              </div>
              <TwoFactorSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
              <CardDescription>Your team and workspace.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <OrganizationSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
