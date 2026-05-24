import { LogOut, User, Mail, Settings, PencilIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import keycloak from "@/lib/keycloak";

export function ProfileScreen() {
  const user = keycloak.tokenParsed;

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  const handleManageAccount = () => {
    const accountUrl = `${keycloak.authServerUrl}/realms/${keycloak.realm}/account`;
    const params = new URLSearchParams({
      referrer: "shaderlab_client",
      referrer_uri: window.location.href,
    });
    window.location.href = `${accountUrl}?${params}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile and account settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Your identity is managed by the authentication provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="given_name">First Name</Label>
              <Input
                id="given_name"
                className=""
                value={user?.given_name ?? ""}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="family_name">Last Name</Label>
              <Input
                id="family_name"
                value={user?.family_name ?? ""}
                readOnly
                disabled
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                value={user?.preferred_username ?? ""}
                readOnly
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={user?.email ?? ""}
                readOnly
                disabled
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
          <Button variant="outline" onClick={handleManageAccount}>
            <PencilIcon className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
