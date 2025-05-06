import bcrypt

# Mot de passe en clair que vous souhaitez utiliser
password = "admin123"

# Gu00e9nu00e9rer le hash
hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

# Afficher le hash (sera utilisu00e9 dans MongoDB)
print("Mot de passe hashu00e9 pour MongoDB:")
print(hashed_password)
