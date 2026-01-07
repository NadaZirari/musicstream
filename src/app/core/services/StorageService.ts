
import { Injectable } from '@angular/core';
import { Track } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly DB_NAME = 'musicstream-db';
  private readonly STORE_NAME = 'tracks';
  private readonly DB_VERSION = 1;

  // 🔹 Ouvrir / créer la base IndexedDB
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        reject('Erreur lors de l’ouverture de IndexedDB');
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  // 🔹 Sauvegarder un track
  async saveTrack(track: Track, audioFile: Blob): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);

      store.put({
        ...track,
        audioFile
      });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject('Erreur lors de la sauvegarde du track');
      });

    } catch (error) {
      throw error;
    }
  }

  // 🔹 Récupérer tous les tracks
  async getAllTracks(): Promise<(Track & { audioFile: Blob })[]> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject('Erreur lors de la lecture des tracks');
      });

    } catch (error) {
      throw error;
    }
  }

  // 🔹 Supprimer un track
  async deleteTrack(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);

      store.delete(id);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject('Erreur lors de la suppression du track');
      });

    } catch (error) {
      throw error;
    }
  }

  // 🔹 Mettre à jour un track (sans changer l’audio)
  async updateTrack(track: Track): Promise<void> {
    try {
      const db = await this.openDB();
      const tx = db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);

      const existing = await store.get(track.id);

      store.put({
        ...existing,
        ...track
      });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject('Erreur lors de la mise à jour du track');
      });

    } catch (error) {
      throw error;
    }
  }
}

