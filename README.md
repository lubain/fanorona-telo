# Fanorona AI Games

#### 1. Backend

```bash
cd backend

# Créer et activer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate   # Windows : .venv\Scripts\activate

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.example .env
# Modifier .env si nécessaire

# Lancer le serveur (rechargement automatique)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Le backend est accessible sur `http://localhost:8000`.  
Documentation interactive Swagger : `http://localhost:8000/docs`

#### 2. Frontend

```bash
cd frontend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Lancer le serveur de développement
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`.
