import { X, User, Phone, Mail, MapPin, Heart, AlertCircle, Building2, ArrowLeftRight, FileText, Pill, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface PatientDetailViewProps {
  patient: {
    id: string;
    name: string;
    age: number;
    gender: string;
    bloodType: string;
    phone: string;
    status: string;
    hospital: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onTransfer: (patientId: string) => void;
}

// Mock data for additional patient details
const getPatientDetails = (patientId: string) => ({
  nationalId: "12345678",
  dob: "1990-05-12",
  email: `${patientId.toLowerCase()}@example.com`,
  address: "123 Main Street, Nairobi, Kenya",
  allergies: ["Penicillin (Severe)", "Peanuts (Moderate)"],
  chronicConditions: ["Hypertension", "Type 2 Diabetes"],
  hospitalId: "HOSP_A_001",
  transferHistory: [
    {
      id: "TRF-001",
      date: "2025-01-15",
      from: "Hospital A",
      to: "Hospital B",
      reason: "Specialist care required",
    },
    {
      id: "TRF-002",
      date: "2024-12-10",
      from: "Hospital C",
      to: "Hospital A",
      reason: "Emergency transfer",
    },
  ],
  encounters: [
    {
      id: "ENC-001",
      date: "2025-01-20",
      type: "Outpatient",
      doctor: "Dr. Amina Omar",
      diagnosis: "Hypertension follow-up",
    },
    {
      id: "ENC-002",
      date: "2025-01-10",
      type: "Emergency",
      doctor: "Dr. John Mwangi",
      diagnosis: "Chest pain evaluation",
    },
    {
      id: "ENC-003",
      date: "2024-12-28",
      type: "Outpatient",
      doctor: "Dr. Amina Omar",
      diagnosis: "Routine check-up",
    },
  ],
  medications: [
    {
      name: "Metoprolol",
      dosage: "50mg",
      frequency: "Once daily",
      prescribedBy: "Dr. Amina Omar",
      startDate: "2024-12-01",
    },
    {
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedBy: "Dr. Amina Omar",
      startDate: "2024-11-15",
    },
    {
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      prescribedBy: "Dr. John Mwangi",
      startDate: "2024-12-10",
    },
  ],
});

export function PatientDetailView({ patient, open, onClose, onTransfer }: PatientDetailViewProps) {
  if (!patient) return null;

  const details = getPatientDetails(patient.id);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl lg:max-w-2xl p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-2xl">{patient.name}</SheetTitle>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-mono">{patient.id}</span>
                    <span>•</span>
                    <span>{patient.age} years</span>
                    <span>•</span>
                    <span>{patient.gender}</span>
                  </div>
                </div>
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
              </div>
            </SheetHeader>

            <Separator />

            {/* Personal Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">National ID</p>
                  <p className="font-medium">{details.nationalId}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{details.dob}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {patient.phone}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {details.email}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    {details.address}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Medical Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Medical Information</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Blood Type</p>
                  <Badge variant="outline" className="font-mono">{patient.bloodType}</Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Allergies</p>
                  <div className="flex flex-wrap gap-2">
                    {details.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline" className="badge-inactive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Chronic Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {details.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="outline">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Current Location */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-lg">Current Location</h3>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">Hospital</p>
                <p className="font-medium">{patient.hospital} ({details.hospitalId})</p>
              </div>
            </div>

            <Separator />

            {/* Transfer History */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-lg">Transfer History</h3>
                </div>
                <Badge variant="secondary">{details.transferHistory.length}</Badge>
              </div>
              <div className="space-y-3">
                {details.transferHistory.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="p-3 rounded-lg border border-border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {transfer.id}
                      </span>
                      <span className="text-xs text-muted-foreground">{transfer.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{transfer.from}</span>
                      <ArrowLeftRight className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{transfer.to}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{transfer.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Recent Encounters */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-lg">Recent Encounters</h3>
                </div>
                <Badge variant="secondary">{details.encounters.length}</Badge>
              </div>
              <div className="space-y-3">
                {details.encounters.map((encounter) => (
                  <div
                    key={encounter.id}
                    className="p-3 rounded-lg border border-border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-muted-foreground">
                        {encounter.id}
                      </span>
                      <Badge variant="outline" className="text-xs">{encounter.type}</Badge>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{encounter.diagnosis}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{encounter.date}</span>
                        <span>•</span>
                        <span>{encounter.doctor}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Current Medications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-lg">Current Medications</h3>
                </div>
                <Badge variant="secondary">{details.medications.length}</Badge>
              </div>
              <div className="space-y-3">
                {details.medications.map((medication, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border border-border bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{medication.name}</p>
                      <span className="text-xs text-muted-foreground">
                        Since {medication.startDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{medication.dosage}</span>
                      <span>•</span>
                      <span>{medication.frequency}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Prescribed by {medication.prescribedBy}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1"
                onClick={() => {
                  onTransfer(patient.id);
                  onClose();
                }}
              >
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                Transfer Patient
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                View Full Record
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
