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


# Fanorona Telo

## Section 1 : En-tête Institutionnel et Identification

### Institut Supérieur Polytechnique de Madagascar (ISPM)

Site officiel de l'institut : https://www.ispm-edu.com

### Projet

**Nom du projet :** Fanorona Telo

**Contexte :**

Le **Fanoron-telo** est un jeu de société traditionnel originaire de Madagascar. Il se joue sur un plateau constitué de 9 intersections (3 × 3) reliées entre elles et oppose deux joueurs possédant chacun trois pions. Malgré des règles simples, ce jeu présente une richesse stratégique qui en fait un excellent sujet d'étude pour l'algorithmique et l'intelligence artificielle.

### Groupe de Projet

**Nom du groupe :** *Alpha squad*

### Année académique

2025 – 2026

### Hackathon

Développement d'une application de jeu Fanorona Telo intégrant plusieurs modes de jeu, dont un mode contre l'intelligence artificielle utilisant différents niveaux de difficulté.

