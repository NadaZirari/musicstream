# MusicStream

## 📖 Description

**MusicStream** est une application musicale locale développée avec **Angular 17**.  
Elle permet aux utilisateurs de gérer et écouter leur musique locale, avec un système CRUD complet pour les tracks et un lecteur audio intégré. L'objectif est de créer une application simple, fonctionnelle et maintenable, offrant une expérience utilisateur fluide.

---

## 🎯 Objectifs du projet

- Gestion complète des tracks (CRUD) avec métadonnées :
  - Nom de la chanson
  - Nom du chanteur
  - Description optionnelle (max 200 caractères)
  - Date d'ajout automatique
  - Durée calculée automatiquement
  - Catégorie musicale (pop, rock, rap, etc.)
- Pages principales :
  - **Bibliothèque** : Liste des tracks avec recherche et filtres
  - **Track** : Affichage détaillé et lecture du track sélectionné
- Lecteur audio :
  - Contrôles : play, pause, next, previous
  - Contrôle du volume et de la progression
  - Gestion des états : playing, paused, buffering, stopped
- Gestion locale des fichiers audio et métadonnées via IndexedDB
- Validation des formulaires et des fichiers audio (taille max 10MB, formats MP3/WAV/OGG)

---

## ⚙️ Fonctionnalités principales

1. **Bibliothèque musicale**
  - Affichage des tracks existants
  - Recherche par titre ou artiste
  - Filtrage par catégorie
  - Suppression d’un track

2. **Ajout de track**
  - Formulaire réactif avec validations
  - Sélection de fichier audio avec validation de taille et format
  - Calcul automatique de la durée du track
  - Réinitialisation du formulaire après ajout

3. **Lecteur audio**
  - Lecture, pause, track suivant, track précédent
  - Progression et volume réglables
  - Gestion réactive de l’état du lecteur

4. **Stockage local**
  - Persistence des tracks et des fichiers audio via IndexedDB
  - Gestion des erreurs de lecture/écriture
  - Interface uniforme pour CRUD

---

## 🛠️ Technologies utilisées

- **Frontend :**
  - Angular 17+
  - TypeScript
  - Reactive Forms
  - RxJS & AsyncPipe pour gestion réactive
  - Components, Modules, Services
  - Routing avec lazy loading
  - CSS (ou Tailwind/Bootstrap selon préférence)
- **Stockage :**
  - IndexedDB pour fichiers audio et métadonnées

---

## 📂 Structure du projet

src/
├─ app/
│ ├─ features/
│ │ └─ library/
│ │ ├─ pages/
│ │ │ └─ library/
│ │ │ ├─ library.component.ts
│ │ │ ├─ library.component.html
│ │ │ └─ library.component.css
│ ├─ core/
│ │ ├─ services/
│ │ │ ├─ track.service.ts
│ │ │ ├─ storage.service.ts
│ │ │ └─ audio-player.service.ts
│ │ └─ models/
│ │ ├─ track.model.ts
│ │ ├─ player-state.model.ts
│ │ └─ state.model.ts


---

## ⚡ Installation et lancement

1. Cloner le projet depuis GitHub :


git clone <https://github.com/NadaZirari/musicstream>
cd musicstream


Installer les dépendances :

npm install


Lancer le serveur de développement :

ng serve


Ouvrir l'application dans le navigateur :

http://localhost:4200
