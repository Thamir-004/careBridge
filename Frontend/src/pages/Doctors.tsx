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
import { fetchDoctors, searchDoctors, type Doctor, useAuthenticatedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addingDoctor, setAddingDoctor] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    firstName: "",
    lastName: "",
    specialty: "",
    phone: "",
    email: "",
    hospital: "City General",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHospital, setSelectedHospital] = useState("City General");
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();

  // Fetch doctors on component mount and when hospital changes
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedDoctors = await fetchDoctors(selectedHospital, authenticatedFetch);
        setDoctors(fetchedDoctors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load doctors');
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, [selectedHospital, toast]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Reload all doctors for selected hospital
      try {
        setLoading(true);
        const fetchedDoctors = await fetchDoctors(selectedHospital, authenticatedFetch);
        setDoctors(fetchedDoctors);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load doctors.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      const results = await searchDoctors(searchTerm, authenticatedFetch);
      setDoctors(results);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to search doctors.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    // For now, just show a message since we don't have create doctor API implemented
    toast({
      title: "Feature Coming Soon",
      description: "Adding doctors functionality will be available soon.",
    });
    setShowAddDialog(false);
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Doctors</h1>
          <p className="text-muted-foreground">Manage doctor information and availability</p>
        </div>
        <Button className="gap-2" onClick={() => setShowAddDialog(true)} disabled={loading}>
          <Plus className="h-4 w-4" />
          New Doctor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Doctor Directory</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="City General">City General</SelectItem>
                  <SelectItem value="County Medical">County Medical</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={handleSearch}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading doctors...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p>Error loading doctors: {error}</p>
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
                    <TableHead>Doctor ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Hospital</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No doctors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <TableRow key={doctor.doctor_id}>
                        <TableCell className="font-mono text-sm">{doctor.doctor_id}</TableCell>
                        <TableCell className="font-medium">
                          {doctor.first_name} {doctor.last_name}
                        </TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>{doctor.phone_number}</TableCell>
                        <TableCell className="text-sm">{doctor.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doctor.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              doctor.availability_status === "Available"
                                ? "text-green-600 border-green-600"
                                : "text-red-600 border-red-600"
                            }
                          >
                            {doctor.availability_status}
                          </Badge>
                        </TableCell>
                        <TableCell>{doctor.hospital_name}</TableCell>
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
            <DialogTitle>Add New Doctor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newDoctor.firstName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newDoctor.lastName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={newDoctor.specialty}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newDoctor.phone}
                onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newDoctor.email}
                onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="hospital">Hospital</Label>
              <Select value={newDoctor.hospital} onValueChange={(value) => setNewDoctor({ ...newDoctor, hospital: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="City General">City General</SelectItem>
                  <SelectItem value="County Medical">County Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddDoctor} disabled={addingDoctor}>
              {addingDoctor && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {addingDoctor ? "Adding..." : "Add Doctor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
