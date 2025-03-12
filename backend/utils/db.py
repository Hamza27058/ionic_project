from pymongo import MongoClient

# Connexion à MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['medical_cabinet']
print("Connected to MongoDB")
