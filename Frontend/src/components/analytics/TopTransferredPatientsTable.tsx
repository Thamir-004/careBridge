import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const patients = [
  { id: "PAT-A-001", name: "John Doe", transfers: 8, lastHospital: "County Medical" },
  { id: "PAT-B-042", name: "Mary Atieno", transfers: 7, lastHospital: "City General" },
  { id: "PAT-C-123", name: "David Kamau", transfers: 6, lastHospital: "Regional Health" },
  { id: "PAT-A-089", name: "Sarah Wanjiku", transfers: 5, lastHospital: "City General" },
  { id: "PAT-B-156", name: "James Omondi", transfers: 5, lastHospital: "County Medical" },
  { id: "PAT-C-078", name: "Grace Njeri", transfers: 4, lastHospital: "Regional Health" },
  { id: "PAT-A-234", name: "Peter Mwangi", transfers: 4, lastHospital: "City General" },
  { id: "PAT-B-201", name: "Lucy Achieng", transfers: 4, lastHospital: "County Medical" },
  { id: "PAT-C-145", name: "Michael Kimani", transfers: 3, lastHospital: "Regional Health" },
  { id: "PAT-A-167", name: "Jane Wambui", transfers: 3, lastHospital: "City General" },
];

export const TopTransferredPatientsTable = () => {
  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Patient ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Transfers</TableHead>
            <TableHead>Current Hospital</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, index) => (
            <TableRow key={patient.id}>
              <TableCell>
                <Badge variant="outline" className="font-mono">
                  #{index + 1}
                </Badge>
              </TableCell>
              <TableCell className="font-mono text-xs">{patient.id}</TableCell>
              <TableCell className="font-medium">{patient.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{patient.transfers}</Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {patient.lastHospital}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
