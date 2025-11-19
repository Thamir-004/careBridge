import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
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
import { searchPatients, type Patient, useAuthenticatedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("lastName");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const results = await searchPatients(searchQuery, searchField, authenticatedFetch);
      setPatients(results);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to search patients.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = (patientId: string) => {
    navigate("/transfer");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Search Records</h1>
          <p className="text-muted-foreground">Search patient records across all hospitals</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Search</CardTitle>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-2 sm:flex-row flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Enter search term..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={searchField} onValueChange={setSearchField}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Search by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastName">Last Name</SelectItem>
                  <SelectItem value="firstName">First Name</SelectItem>
                  <SelectItem value="patientId">Patient ID</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Searching patients...</span>
            </div>
          ) : patients.length === 0 && searchQuery ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No patients found matching "{searchQuery}"</p>
            </div>
          ) : patients.length > 0 ? (
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Enter a search term and click Search to find patients across all hospitals</p>
            </div>
          )}
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
