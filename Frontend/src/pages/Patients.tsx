import { useState, useEffect } from "react";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PatientDetailView } from "@/components/patients/PatientDetailView";
import { useNavigate } from "react-router-dom";
import { fetchPatients, createPatient, type Patient, useAuthenticatedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    gender: "Male",
    bloodType: "A+",
    phone: "",
    hospital: "City General",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();

  // Fetch patients on component mount
  useEffect(() => {
    const loadPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedPatients = await fetchPatients('City General', authenticatedFetch);
        setPatients(fetchedPatients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load patients');
        toast({
          title: "Error",
          description: "Failed to load patients. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [toast]);

  const handleTransfer = (patientId: string) => {
    navigate("/transfer");
  };

  const handleAddPatient = async () => {
    try {
      setAddingPatient(true);
      const patientData = {
        name: newPatient.name,
        age: parseInt(newPatient.age),
        gender: newPatient.gender,
        bloodType: newPatient.bloodType,
        phone: newPatient.phone,
        hospital: newPatient.hospital,
      };

      const createdPatient = await createPatient(patientData, authenticatedFetch);
      setPatients([...patients, createdPatient]);

      // Reset form
      setNewPatient({
        name: "",
        age: "",
        gender: "Male",
        bloodType: "A+",
        phone: "",
        hospital: "City General",
      });
      setShowAddDialog(false);

      toast({
        title: "Success",
        description: "Patient added successfully.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add patient.",
        variant: "destructive",
      });
    } finally {
      setAddingPatient(false);
    }
  };

  const filteredPatients = patients.filter(patient => patient.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage patient records and information</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)} disabled={loading}>
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
                <Input placeholder="Search patients..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading patients...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading patients: {error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
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
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={newPatient.gender} onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={newPatient.bloodType} onValueChange={(value) => setNewPatient({ ...newPatient, bloodType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hospital">Hospital</Label>
              <Select value={newPatient.hospital} onValueChange={(value) => setNewPatient({ ...newPatient, hospital: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="City General">City General</SelectItem>
                  <SelectItem value="County Medical">County Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddPatient} disabled={addingPatient}>
              {addingPatient && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {addingPatient ? "Adding..." : "Add Patient"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <PatientDetailView
        patient={selectedPatient}
        open={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        onTransfer={handleTransfer}
      />
    </div>
  );
}
