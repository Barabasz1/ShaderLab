import { LogOut, User, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import keycloak from "@/auth/keycloak";

export function ProfileScreen() {
    const handleLogout = () => {
        keycloak.logout({
            redirectUri: window.location.origin,
        });
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
                        Update your account details and public presence.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback>UN</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" size="sm">
                            Change Picture
                        </Button>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Username
                            </Label>
                            <Input id="username" defaultValue="node_wizard" readOnly />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                Email Address
                            </Label>
                            <Input id="email" type="email" defaultValue="user@example.com" readOnly />
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t pt-6 mt-2">
                    <Button variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        Preferences
                    </Button>

                    <Button variant="destructive" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}