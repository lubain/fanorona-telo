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

* Application web : `https://fanorona-telo-neon.vercel.app/`
* API Backend : `https://fanorona-telo.fastapicloud.dev/`


## Section 5 : Modélisation et Algorithmes de l'IA du Jeu

### Représentation de l'état du plateau

Le plateau de Fanorona Telo est représenté par une structure de données de type **liste de neuf entiers** :

```python
board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
```

Chaque case du plateau correspond à une intersection du plateau 3 × 3 :

* `1` : pion du joueur X ;
* `-1` : pion du joueur O ;
* `0` : intersection libre.

Les lignes gagnantes (horizontales, verticales et diagonales) sont stockées dans une constante `LINES`, qui permet de détecter efficacement les alignements :

```python
LINES = [
    (0,1,2), (3,4,5), (6,7,8),
    (0,3,6), (1,4,7), (2,5,8),
    (0,4,8), (2,4,6)
]
```

Les déplacements possibles entre intersections sont modélisés à l'aide d'une liste d'adjacence `ADJACENCES`, permettant de générer uniquement les mouvements autorisés pendant la phase de déplacement.

### Modélisation des états du jeu

Chaque état du jeu est représenté par la classe `FanoronaTeloNode`, qui contient :

* la configuration actuelle du plateau ;
* le joueur dont c'est le tour ;
* les méthodes de génération des coups possibles ;
* la détection des états terminaux ;
* la fonction d'évaluation heuristique.

La méthode `get_successors()` permet de générer tous les états fils accessibles depuis l'état courant :

* pendant la phase de placement, un pion est placé sur chaque case libre ;
* pendant la phase de déplacement, un pion peut être déplacé vers une intersection adjacente libre.

Cette représentation forme implicitement un arbre de recherche utilisé par l'intelligence artificielle.

### Algorithme Minimax avec élagage Alpha-Beta

L'intelligence artificielle est basée sur l'algorithme **Minimax avec élagage Alpha-Beta**.

Le principe consiste à :

1. Générer tous les coups possibles.
2. Simuler récursivement les réponses de l'adversaire.
3. Évaluer les positions obtenues.
4. Choisir le coup maximisant les chances de victoire.

L'élagage Alpha-Beta permet d'éliminer certaines branches de l'arbre lorsqu'il est déjà établi qu'elles ne peuvent pas améliorer la solution courante. Cette optimisation réduit considérablement le nombre d'états explorés et améliore le temps de calcul.

La meilleure position trouvée est mémorisée dans l'attribut :

```python
node.best
```

afin de récupérer directement le coup optimal.

### Fonction d'évaluation heuristique

Lorsque la profondeur maximale est atteinte ou qu'une position terminale est rencontrée, la fonction `evaluate()` attribue un score à la position.

#### Victoire ou défaite

Une victoire du joueur étudié reçoit une valeur élevée :

```python
100
```

tandis qu'une défaite reçoit :

```python
-100
```

#### Contrôle du centre

La case centrale (indice 4) étant stratégiquement importante, un bonus est attribué :

```python
+10
```

si elle est occupée par le joueur, et :

```python
-10
```

si elle est contrôlée par l'adversaire.

#### Détection des menaces

Une ligne contenant :

* deux pions du joueur ;
* une case vide ;

reçoit un bonus :

```python
+20
```

car elle représente une opportunité de victoire.

À l'inverse, une ligne contenant deux pions adverses et une case libre reçoit une pénalité :

```python
-50
```

afin d'encourager l'IA à bloquer les menaces de l'adversaire.

### Niveaux de difficulté

Trois niveaux de difficulté sont proposés :

| Niveau    | Méthode utilisée                                      |
| --------- | ----------------------------------------------------- |
| Facile    | Coup aléatoire                                        |
| Moyen     | Alpha-Beta profondeur 3 avec 20 % de coups aléatoires |
| Difficile | Alpha-Beta profondeur 9                               |

Le niveau difficile recherche le meilleur coup possible et produit un comportement proche du jeu optimal.

### Techniques avancées utilisées

| Technique                                           | Utilisée |
| --------------------------------------------------- | -------- |
| Minimax                                             | ✅        |
| Élagage Alpha-Beta                                  | ✅        |
| Fonction heuristique                                | ✅        |
| Profondeur variable selon le niveau                 | ✅        |

### Complexité

L'utilisation de l'élagage Alpha-Beta permet de réduire significativement le nombre de positions explorées par rapport à un Minimax classique. Dans le niveau difficile, l'algorithme explore récursivement les états jusqu'à une profondeur de neuf coups, tout en éliminant les branches non pertinentes grâce aux bornes α (alpha) et β (bêta), ce qui améliore considérablement les performances du moteur de jeu.
