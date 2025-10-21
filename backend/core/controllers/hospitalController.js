import Hospital from "../models/Hospital.js";

export const getHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate("departments");
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHospitalById = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).populate("departments");
    if (!hospital) return res.status(404).json({ message: "Hospital not found" });
    res.json(hospital);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createHospital = async (req, res) => {
  try {
    const hospital = new Hospital(req.body);
    const savedHospital = await hospital.save();
    res.status(201).json(savedHospital);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
