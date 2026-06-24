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

## Section 1 

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

## Membres de l'équipe

| Nom complet                         | Numéro d'étudiant | Classe      | Rôle précis pour ce Hackathon                                         |
| ----------------------------------- | ----------------- | ----------- | --------------------------------------------------------------------- |
| ZAFINDRAMANGA Lubain Fadhel         |    36             | IGGLIA 4    | Chef de projet / Développeur Full Stack                               |
| AINA RAKOTONDRAMBOLA Lova Nasaina   |    06             | IGGLIA 4    | Développeur Back-End et gestion des règles du jeu                     |
| RAHERIMANANTENA Fedro Hubert        |    20             | IGGLIA 4    | Développeur Front-End et conception de l'interface utilisateur        |
| LIOKA Ranarison Fiderana            |    12             | IGGLIA 4    | Développeur IA et implémentation des algorithmes Minimax / Alpha-Beta |
| RAKOTOARISON Andonirina             |    13             | IGGLIA 4    | Testeur et validation fonctionnelle                                   |
|  RAKOTOARIMANITRA Andy Franck       |    33             | IGGLIA 4    | Testeur et validation fonctionnelle                                   |


## Section 2 : Description du Travail Réalisé

### Présentation de l'application

**Fanorona Telo** est une application web permettant de jouer au jeu traditionnel malgache Fanoron-telo. L'application implémente l'ensemble des règles du jeu et propose plusieurs modes de jeu afin d'offrir une expérience interactive et stratégique aux utilisateurs.

### Fonctionnalités implémentées

* Mode **Humain vs Humain** en local.
* Mode **Humain vs IA** avec plusieurs niveaux de difficulté.
* Gestion complète et robuste des règles du jeu :

  * Phase de placement des pions.
  * Détection automatique des alignements gagnants.
  * Phase de déplacement des pions vers les intersections adjacentes.
  * Validation des coups autorisés.
* Mode **IA vs IA** permettant de visualiser le déroulement automatique d'une partie.
* Interface utilisateur interactive et responsive.
* Communication entre le frontend et le backend via une API REST.

### Architecture et pile technologique

L'application est conçue selon une architecture client-serveur :

* **Frontend :**

  * React
  * TypeScript
  * Architecture Clean (séparation des couches Domain, Application, Infrastructure et Presentation)

* **Backend :**

  * Python
  * FastAPI
  * API REST pour la gestion des parties et des algorithmes d'intelligence artificielle

* **Déploiement :**

  * Frontend hébergé sur **Vercel**
  * Backend hébergé sur **FastAPI Cloud**

### Architecture générale

```text
Frontend (React + Clean Architecture)
                │
                │ HTTP / API REST
                ▼
Backend (FastAPI)
                │
                ├── Gestion des règles du jeu
                ├── Moteur d'intelligence artificielle
                └── Validation des coups
```

### Version hébergée

* Application web : `https://<frontend-url>`
* API Backend : `https://<backend-url>`
