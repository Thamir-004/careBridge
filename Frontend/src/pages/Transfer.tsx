import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { transferPatient, fetchPatients, type Patient, useAuthenticatedFetch, type TransferRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useHospital } from "@/contexts/HospitalContext";

export default function Transfer() {
  const { selectedHospital, hospitals } = useHospital();
  const [patientId, setPatientId] = useState("");
  const [fromHospital, setFromHospital] = useState(hospitals[0]?.id || "");
  const [toHospital, setToHospital] = useState(hospitals[1]?.id || "");
  const [reason, setReason] = useState("");
  const [transferredBy, setTransferredBy] = useState("");
  const [includeHistory, setIncludeHistory] = useState(true);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);

  const navigate = useNavigate();
  const { toast } = useToast();
  const authenticatedFetch = useAuthenticatedFetch();
  const queryClient = useQueryClient();

  const handleSearchPatient = async () => {
    const fromHospitalName = hospitals.find(h => h.id === fromHospital)?.name || fromHospital;
    console.log('handleSearchPatient called with patientId:', patientId, 'fromHospital:', fromHospital);
    if (!patientId.trim()) {
      console.log('patientId is empty');
      toast({
        title: "Error",
        description: "Please enter a patient ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSearchingPatient(true);
      console.log('Fetching patients from', fromHospitalName);
      // Search across hospitals for the patient
      const patients = await fetchPatients(fromHospitalName, authenticatedFetch);
      console.log('Fetched patients:', patients.length);
      const patient = patients.find(p => p.id === patientId);
      console.log('Found patient:', patient);

      if (patient) {
        setFoundPatient(patient);
        console.log('setFoundPatient called');
        toast({
          title: "Patient Found",
          description: `Found ${patient.name} at ${patient.hospital}`,
        });
      } else {
        setFoundPatient(null);
        console.log('setFoundPatient(null)');
        toast({
          title: "Patient Not Found",
          description: `No patient with ID ${patientId} found at ${fromHospitalName}`,
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error searching patient:', err);
      toast({
        title: "Error",
        description: "Failed to search for patient.",
        variant: "destructive",
      });
    } finally {
      setSearchingPatient(false);
    }
  };

  const transferMutation = useMutation({
    mutationFn: (transferData: TransferRequest) => transferPatient(transferData, authenticatedFetch),
    onSuccess: (data, variables) => {
      console.log('[DEBUG] Transfer: Mutation succeeded, data:', data);
      console.log('[DEBUG] Transfer: Invalidating transfers query with key:', ['transfers', 'all', selectedHospital.id]);
      console.log('[DEBUG] Transfer: Invalidating analytics query with key:', ['analytics']);

      toast({
        title: "Success",
        description: `Patient ${foundPatient?.name} has been transferred successfully.`,
      });

      // Reset form
      setPatientId("");
      setFoundPatient(null);
      setReason("");
      setTransferredBy("");

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['transfers', 'all', selectedHospital.id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });

      console.log('[DEBUG] Transfer: Queries invalidated, navigating to /transfers');

      // Navigate to transfers page to see the transfer
      navigate("/transfers");
    },
    onError: (error) => {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to transfer patient.",
        variant: "destructive",
      });
    },
  });

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
                  {hospitals.map(hospital => (
                    <SelectItem key={hospital.id} value={hospital.id}>{hospital.name}</SelectItem>
                  ))}
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
                  {hospitals.map(hospital => (
                    <SelectItem key={hospital.id} value={hospital.id}>{hospital.name}</SelectItem>
                  ))}
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
              onClick={() => {
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

                const transferData = {
                  patientId: foundPatient.id,
                  fromHospital,
                  toHospital,
                  reason,
                  transferredBy,
                  includeFullHistory: includeHistory,
                };

                transferMutation.mutate(transferData);
              }}
              disabled={transferMutation.isPending || !foundPatient}
              className="w-full"
            >
              {transferMutation.isPending ? (
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
                <span className="text-sm">{hospitals.find(h => h.id === fromHospital)?.name || fromHospital}</span>
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm">{hospitals.find(h => h.id === toHospital)?.name || toHospital}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
