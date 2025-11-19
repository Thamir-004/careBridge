import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Hospital ID mappings
const HOSPITAL_IDS = {
  'City General': 'HOSP_A_001',
  'County Medical': 'HOSP_B_001',
};

// Custom hook for authenticated API calls
export const useAuthenticatedFetch = () => {
  const { getToken } = useAuth();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    return fetch(url, { ...options, headers });
  };

  return authenticatedFetch;
};

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  phone: string;
  status: string;
  hospital: string;
}

export interface BackendPatient {
  patient_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  date_of_birth: string;
  gender: string;
  blood_type: string;
  phone_number: string;
  status: string;
  hospital_name: string;
  age?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PatientsResponse extends ApiResponse<BackendPatient[]> {
  total: number;
  page: number;
  limit: number;
}

// Map backend patient to frontend patient
function mapBackendToFrontend(backendPatient: BackendPatient): Patient {
  const fullName = backendPatient.middle_name
    ? `${backendPatient.first_name} ${backendPatient.middle_name} ${backendPatient.last_name}`
    : `${backendPatient.first_name} ${backendPatient.last_name}`;

  return {
    id: backendPatient.patient_id,
    name: fullName,
    age: backendPatient.age || calculateAge(new Date(backendPatient.date_of_birth)),
    gender: backendPatient.gender,
    bloodType: backendPatient.blood_type,
    phone: backendPatient.phone_number,
    status: backendPatient.status.toLowerCase(),
    hospital: backendPatient.hospital_name,
  };
}

// Calculate age from date of birth
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// Fetch patients from a hospital
export async function fetchPatients(hospitalName: string = 'City General', authenticatedFetch?: (url: string, options?: RequestInit) => Promise<Response>): Promise<Patient[]> {
  const hospitalId = HOSPITAL_IDS[hospitalName as keyof typeof HOSPITAL_IDS] || 'HOSP_A_001';

  try {
    const fetchFn = authenticatedFetch || fetch;
    const response = await fetchFn(`${API_BASE_URL}/patients/${hospitalId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result: PatientsResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch patients');
    }

    return result.data.map(mapBackendToFrontend);
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
}

// Create a new patient
export async function createPatient(patientData: Omit<Patient, 'id' | 'status'>, authenticatedFetch?: (url: string, options?: RequestInit) => Promise<Response>): Promise<Patient> {
  const hospitalId = HOSPITAL_IDS[patientData.hospital as keyof typeof HOSPITAL_IDS] || 'HOSP_A_001';

  // Map frontend data to backend format
  const backendData = {
    patient_id: `PAT-${hospitalId.split('_')[1]}-${String(Date.now()).slice(-6)}`, // Generate ID
    first_name: patientData.name.split(' ')[0],
    last_name: patientData.name.split(' ').slice(1).join(' ') || 'Unknown',
    date_of_birth: new Date(Date.now() - patientData.age * 365 * 24 * 60 * 60 * 1000).toISOString(), // Approximate
    gender: patientData.gender,
    blood_type: patientData.bloodType,
    phone_number: patientData.phone,
    email: `${patientData.name.toLowerCase().replace(' ', '.')}@example.com`, // Placeholder
    hospital_id: hospitalId,
    hospital_name: patientData.hospital,
    national_id: `ID${Date.now()}`, // Placeholder
  };

  try {
    const fetchFn = authenticatedFetch || fetch;
    const response = await fetchFn(`${API_BASE_URL}/patients/${hospitalId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: ApiResponse<BackendPatient> = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create patient');
    }

    return mapBackendToFrontend(result.data);
  } catch (error) {
    console.error('Error creating patient:', error);
    throw error;
  }
}