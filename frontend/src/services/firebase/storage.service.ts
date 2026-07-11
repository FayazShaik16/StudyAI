import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  getMetadata
} from "firebase/storage"
import type { UploadTaskSnapshot } from "firebase/storage"
import { storage } from "@/config/firebase"
import { handleFirebaseError } from "@/utils/firebaseErrors"
import type { UploadResult, StorageMetadata, FirestoreResponse } from "@/types/firebase"

export class StorageService {
  
  static validateFile(file: File, maxSizeMB: number, allowedTypes: string[]): string | null {
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported.`
    }
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds the ${maxSizeMB}MB limit.`
    }
    return null
  }

  static uploadFile(
    path: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FirestoreResponse<UploadResult>> {
    return new Promise((resolve) => {
      try {
        const storageRef = ref(storage, path)
        const uploadTask = uploadBytesResumable(storageRef, file)

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            if (onProgress) onProgress(progress)
          },
          (error) => {
            resolve({ data: null, success: false, error: handleFirebaseError(error) })
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              resolve({
                data: {
                  url: downloadURL,
                  path,
                  size: file.size,
                  type: file.type
                },
                success: true,
                error: null
              })
            } catch (error) {
              resolve({ data: null, success: false, error: handleFirebaseError(error) })
            }
          }
        )
      } catch (error) {
        resolve({ data: null, success: false, error: handleFirebaseError(error) })
      }
    })
  }

  static async deleteFile(path: string): Promise<FirestoreResponse<void>> {
    try {
      const storageRef = ref(storage, path)
      await deleteObject(storageRef)
      return { data: undefined, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async getFileUrl(path: string): Promise<FirestoreResponse<string>> {
    try {
      const storageRef = ref(storage, path)
      const url = await getDownloadURL(storageRef)
      return { data: url, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }

  static async getFileMetadata(path: string): Promise<FirestoreResponse<StorageMetadata>> {
    try {
      const storageRef = ref(storage, path)
      const metadata = await getMetadata(storageRef)
      return { data: metadata as unknown as StorageMetadata, success: true, error: null }
    } catch (error) {
      return { data: null, success: false, error: handleFirebaseError(error) }
    }
  }
}
