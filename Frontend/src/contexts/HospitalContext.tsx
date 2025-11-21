import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Hospital {
  id: string;
  name: string;
}

interface HospitalContextType {
  selectedHospital: Hospital;
  setSelectedHospital: (hospital: Hospital) => void;
  hospitals: Hospital[];
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const hospitals: Hospital[] = [
  { id: "HOSP_A_001", name: "City General Hospital" },
  { id: "HOSP_B_001", name: "Metro Medical Center" },
  { id: "HOSP_C_001", name: "Regional Health Center" },
];

export const HospitalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedHospital, setSelectedHospitalState] = useState<Hospital>(hospitals[0]);

  useEffect(() => {
    const savedHospital = localStorage.getItem('selectedHospital');
    if (savedHospital) {
      const hospital = hospitals.find(h => h.id === savedHospital);
      if (hospital) {
        setSelectedHospitalState(hospital);
      }
    }
  }, []);

  const setSelectedHospital = (hospital: Hospital) => {
    setSelectedHospitalState(hospital);
    localStorage.setItem('selectedHospital', hospital.id);
  };

  return (
    <HospitalContext.Provider value={{ selectedHospital, setSelectedHospital, hospitals }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (context === undefined) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};