from models.patient_model import Patient

class PatientService:
    @staticmethod
    def inscrire_patient(nom, email, telephone):
        if Patient.trouver_par_email(email):
            return {"message": "Patient déjà inscrit"}, 400

        patient = Patient(nom, email, telephone)
        patient.sauvegarder()
        return {"message": "Patient inscrit avec succès"}, 201
