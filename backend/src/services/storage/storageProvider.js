export class StorageProvider {
  /**
   * Uploads a file to the storage provider
   * @param {Object} file - The file object (usually from multer)
   * @param {String} purpose - The purpose of the upload (e.g. COURSE_MATERIAL)
   * @returns {Promise<{ storageKey: string, fileUrl: string, fileSize: number, fileType: string, extension: string, originalFileName: string }>}
   */
  async upload(file, purpose) {
    throw new Error('Method not implemented.');
  }

  /**
   * Deletes a file from the storage provider
   * @param {String} storageKey - The unique key returned from upload()
   * @returns {Promise<void>}
   */
  async delete(storageKey) {
    throw new Error('Method not implemented.');
  }
}
