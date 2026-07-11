import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  writeBatch,
  serverTimestamp,
  runTransaction
} from "firebase/firestore"
import type {
  DocumentData,
  QueryConstraint,
  Transaction
} from "firebase/firestore"
import { db } from "@/config/firebase"
import { handleFirebaseError } from "@/utils/firebaseErrors"
import type { FirestoreResponse } from "@/types/firebase"

export class FirestoreService {
  
  static getTimestamp() {
    return serverTimestamp()
  }

  static async createDocument<T extends DocumentData>(
    collectionName: string, 
    id: string, 
    data: T
  ): Promise<FirestoreResponse<T>> {
    try {
      const docRef = doc(db, collectionName, id)
      await setDoc(docRef, data)
      return { data, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async readDocument<T = DocumentData>(
    collectionName: string, 
    id: string
  ): Promise<FirestoreResponse<T>> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { data: docSnap.data() as T, success: true, error: null }
      }
      return { data: null, success: false, error: { code: 'not-found', message: 'Document not found' } }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async updateDocument<T extends DocumentData>(
    collectionName: string, 
    id: string, 
    data: Partial<T>
  ): Promise<FirestoreResponse<void>> {
    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, data as any)
      return { data: undefined, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async deleteDocument(
    collectionName: string, 
    id: string
  ): Promise<FirestoreResponse<void>> {
    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
      return { data: undefined, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async queryCollection<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[]
  ): Promise<FirestoreResponse<T[]>> {
    try {
      const colRef = collection(db, collectionName)
      const q = query(colRef, ...constraints)
      const querySnapshot = await getDocs(q)
      const results: T[] = []
      querySnapshot.forEach((document) => {
        results.push(document.data() as T)
      })
      return { data: results, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async batchOperations(
    operations: (batch: ReturnType<typeof writeBatch>) => void
  ): Promise<FirestoreResponse<void>> {
    try {
      const batch = writeBatch(db)
      operations(batch)
      await batch.commit()
      return { data: undefined, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async executeTransaction<T>(
    updateFunction: (transaction: Transaction) => Promise<T>
  ): Promise<FirestoreResponse<T>> {
    try {
      const result = await runTransaction(db, updateFunction)
      return { data: result as T, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }
}
