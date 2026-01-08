import { Injectable } from '@angular/core';
import { Track } from '../models/track.model';

type StoredTrack = Track & { audioFile: Blob };

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly DB_NAME = 'musicstream-db';
  private readonly STORE_NAME = 'tracks';
  private readonly DB_VERSION = 1;

  // 🔹 Ouvrir / créer IndexedDB
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () =>
        reject('Erreur lors de l’ouverture de IndexedDB');

      request.onsuccess = () =>
        resolve(request.result);

      request.onupgradeneeded = (event: any) => {
        const db: IDBDatabase = event.target.result;

        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // ➕ Ajouter un track
  async addTrack(track: StoredTrack): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);

    store.put(track);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject('Erreur lors de la sauvegarde du track');
    });
  }

  // 📥 Récupérer tous les tracks
  async getAllTracks(): Promise<StoredTrack[]> {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();

      request.onsuccess = () =>
        resolve(request.result as StoredTrack[]);

      request.onerror = () =>
        reject('Erreur lors de la lecture des tracks');
    });
  }

  // 🗑 Supprimer un track
  async deleteTrack(id: string): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);

    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject('Erreur lors de la suppression du track');
    });
  }

  // ✏️ Mettre à jour un track (sans changer l’audio)
  async updateTrack(track: Track): Promise<void> {
    const db = await this.openDB();
    const tx = db.transaction(this.STORE_NAME, 'readwrite');
    const store = tx.objectStore(this.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(track.id);

      request.onsuccess = () => {
        const existing = request.result as StoredTrack;

        store.put({
          ...existing,
          ...track
        });

        resolve();
      };

      request.onerror = () =>
        reject('Erreur lors de la mise à jour du track');
    });
  }

  // 🔹 Sauvegarder un track
  async saveTrack(track: Omit<Track, 'id' | 'createdAt' | 'audioUrl'>, audioFile: File): Promise<string> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.STORE_NAME, 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      const newTrack: StoredTrack = {
        ...track,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        audioFile: audioFile,
        audioUrl: '', // Will be generated when retrieved
        duration: 0   // Will be set after audio is loaded
      };

      const request = store.add(newTrack);

      request.onsuccess = () => resolve(newTrack.id);
      request.onerror = () => reject(request.error);
    });
  }
}
