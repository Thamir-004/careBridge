import { useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { transferPatient, fetchPatients, type Patient, useAuthenticatedFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function Transfer() {
  const [patientId, setPatientId] = useState("");
  const [fromHospital, setFromHospital] = useState("City General");
  const [toHospital, setToHospital] = useState("County Medical");
  const [reason, setReason] = useState("");
  const [transferredBy, setTransferredBy] = useState("");
  const [includeHistory, setIncludeHistory] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();

  const handleSearchPatient = async () => {
    if (!patientId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a patient ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearchingPatient(true);
      // Search across hospitals for the patient
      const patients = await fetchPatients(fromHospital, authenticatedFetch);
      const patient = patients.find(p => p.id === patientId);

      if (patient) {
        setFoundPatient(patient);
        toast({
          title: "Patient Found",
          description: `Found ${patient.name} at ${patient.hospital}`,
        });
      } else {
        setFoundPatient(null);
        toast({
          title: "Patient Not Found",
          description: `No patient with ID ${patientId} found at ${fromHospital}`,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to search for patient.",
        variant: "destructive",
      });
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleTransfer = async () => {
    if (!foundPatient) {
      toast({
        title: "Error",
        description: "Please search and select a patient first.",
        variant: "destructive",
      });
      return;
    }

    if (fromHospital === toHospital) {
      toast({
        title: "Error",
        description: "Source and destination hospitals must be different.",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim() || !transferredBy.trim()) {
      toast({
        title: "Error",
        description: "Please provide reason and transferred by information.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const transferData = {
        patientId: foundPatient.id,
        fromHospital,
        toHospital,
        reason,
        transferredBy,
        includeFullHistory: includeHistory,
      };

      const result = await transferPatient(transferData, authenticatedFetch);

      toast({
        title: "Success",
        description: `Patient ${foundPatient.name} has been transferred successfully.`,
      });

      // Reset form
      setPatientId("");
      setFoundPatient(null);
      setReason("");
      setTransferredBy("");

      // Navigate to transfers page to see the transfer
      navigate("/transfers");
    } catch (err) {
      toast({
        title: "Transfer Failed",
        description: err instanceof Error ? err.message : "Failed to transfer patient.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transfer Patient</h1>
        <p className="text-muted-foreground">Transfer a patient from one hospital to another</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Patient Search */}
        <Card>
          <CardHeader>
            <CardTitle>Find Patient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fromHospital">From Hospital</Label>
              <Select value={fromHospital} onValueChange={setFromHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="City General">City General</SelectItem>
                  <SelectItem value="County Medical">County Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="patientId">Patient ID</Label>
              <div className="flex gap-2">
                <Input
                  id="patientId"
                  placeholder="Enter patient ID"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchPatient()}
                />
                <Button
                  onClick={handleSearchPatient}
                  disabled={searchingPatient}
                  variant="outline"
                >
                  {searchingPatient ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {foundPatient && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Patient Details</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {foundPatient.name}</p>
                  <p><strong>ID:</strong> {foundPatient.id}</p>
                  <p><strong>Age:</strong> {foundPatient.age}</p>
                  <p><strong>Gender:</strong> {foundPatient.gender}</p>
                  <p><strong>Blood Type:</strong> {foundPatient.bloodType}</p>
                  <p><strong>Status:</strong> <Badge variant="outline">{foundPatient.status}</Badge></p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="toHospital">To Hospital</Label>
              <Select value={toHospital} onValueChange={setToHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination hospital" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="City General">City General</SelectItem>
                  <SelectItem value="County Medical">County Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transferredBy">Transferred By</Label>
              <Input
                id="transferredBy"
                placeholder="Enter your name or ID"
                value={transferredBy}
                onChange={(e) => setTransferredBy(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="reason">Reason for Transfer</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for transfer"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeHistory"
                checked={includeHistory}
                onChange={(e) => setIncludeHistory(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="includeHistory">Include full medical history</Label>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={loading || !foundPatient}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Transfer Patient
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Transfer Summary */}
      {foundPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Transfer Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{foundPatient.name}</p>
                <p className="text-sm text-muted-foreground">Patient ID: {foundPatient.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{fromHospital}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">{toHospital}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
