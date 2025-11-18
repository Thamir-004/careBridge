import { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PatientDetailView } from "@/components/patients/PatientDetailView";
import { useNavigate } from "react-router-dom";

const patients = [
  {
    id: "PAT-A-001",
    name: "John Doe",
    age: 34,
    gender: "Male",
    bloodType: "O+",
    phone: "+254712345678",
    status: "active",
    hospital: "City General",
  },
  {
    id: "PAT-A-002",
    name: "Mary Atieno",
    age: 28,
    gender: "Female",
    bloodType: "A+",
    phone: "+254723456789",
    status: "active",
    hospital: "City General",
  },
  {
    id: "PAT-A-003",
    name: "David Kamau",
    age: 45,
    gender: "Male",
    bloodType: "B+",
    phone: "+254734567890",
    status: "transferred",
    hospital: "County Medical",
  },
  {
    id: "PAT-A-004",
    name: "Sarah Wanjiku",
    age: 52,
    gender: "Female",
    bloodType: "AB+",
    phone: "+254745678901",
    status: "active",
    hospital: "City General",
  },
  {
    id: "PAT-A-005",
    name: "James Omondi",
    age: 39,
    gender: "Male",
    bloodType: "O-",
    phone: "+254756789012",
    status: "active",
    hospital: "City General",
  },
];

export default function Patients() {
  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const navigate = useNavigate();

  const handleTransfer = (patientId: string) => {
    navigate("/transfer");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and information</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Patient Records</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search patients..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Blood Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hospital</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow 
                    key={patient.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    <TableCell className="font-mono text-sm">{patient.id}</TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{patient.bloodType}</Badge>
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          patient.status === "active"
                            ? "badge-active"
                            : patient.status === "transferred"
                            ? "badge-transferred"
                            : "badge-inactive"
                        }
                      >
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.hospital}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PatientDetailView
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onTransfer={handleTransfer}
      />
    </div>
  );
}
