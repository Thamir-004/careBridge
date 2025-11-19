import { Building2, ChevronDown, Menu, User } from "lucide-react";
import { Button } from "./ui/button";
import { SidebarTrigger } from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState } from "react";
import { useUser, SignOutButton } from '@clerk/clerk-react';

const hospitals = [
  { id: "HOSP_A_001", name: "City General Hospital" },
  { id: "HOSP_B_001", name: "County Medical Center" },
  { id: "HOSP_C_001", name: "Regional Health Facility" },
];

export const TopBar = () => {
  const [selectedHospital, setSelectedHospital] = useState(hospitals[0]);
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SidebarTrigger>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">{selectedHospital.name}</span>
              <span className="sm:hidden">{selectedHospital.id}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 bg-popover">
            <DropdownMenuLabel>Select Hospital</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hospitals.map((hospital) => (
              <DropdownMenuItem
                key={hospital.id}
                onClick={() => setSelectedHospital(hospital)}
                className="cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{hospital.name}</span>
                  <span className="text-xs text-muted-foreground">{hospital.id}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-popover">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.firstName} {user?.lastName}</span>
              <span className="text-xs font-normal text-muted-foreground">
                User
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <SignOutButton redirectUrl="/">
            <DropdownMenuItem className="text-destructive">Logout</DropdownMenuItem>
          </SignOutButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
