import os
import uuid
import time
from datetime import datetime, timezone
from werkzeug.utils import secure_filename
from services.db_service import db_service

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'uploads')
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

class MaterialsService:
    def upload_material(self, user_id, file):
        if not file or not file.filename:
            raise ValueError("No file provided")
            
        filename = secure_filename(file.filename)
        file_ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        
        allowed_extensions = {'pdf', 'docx', 'txt'}
        if file_ext not in allowed_extensions:
            raise ValueError(f"Unsupported file type: {file_ext}")
            
        # Temporarily save to get file size for duplicate check
        material_id = str(uuid.uuid4())
        safe_filename = f"{material_id}_{filename}"
        filepath = os.path.join(UPLOAD_DIR, safe_filename)
        
        file.save(filepath)
        file_size = os.path.getsize(filepath)
        
        # Duplicate detection (check non-deleted items)
        for existing in self.get_user_materials(user_id, include_deleted=True):
            if not existing.get('deleted', False) and existing.get('originalFileName') == filename and existing.get('fileSize') == file_size:
                # Remove saved file to avoid orphans
                if os.path.exists(filepath):
                    os.remove(filepath)
                raise ValueError("A study module with the same name and file size already exists.")
        
        now = datetime.now(timezone.utc).isoformat()
        
        material_data = {
            "materialId": material_id,
            "userId": user_id,
            "title": filename,
            "originalFileName": filename,
            "fileType": file_ext,
            "fileSize": file_size,
            "storagePath": filepath, # Local path for fallback
            "downloadUrl": f"/api/v1/materials/download/{material_id}",
            "uploadStatus": "COMPLETED",
            "createdAt": now,
            "updatedAt": now,
            "tags": [],
            "subject": "General",
            "description": "",
            "aiStatus": "PENDING",
            "deleted": False
        }
        
        db_service.create_material(material_id, material_data)
        return material_data

    def get_user_materials(self, user_id, include_deleted=False):
        all_mats = db_service.get_user_materials(user_id)
        if include_deleted:
            return all_mats
        return [m for m in all_mats if not m.get('deleted', False)]

    def get_material(self, material_id, user_id):
        mat = db_service.get_material(material_id)
        # Handle case when user_id is None (bypass check for downloads)
        if not mat or (user_id is not None and mat.get('userId') != user_id):
            raise ValueError("Material not found")
        return mat

    def update_material(self, material_id, user_id, update_data):
        mat = self.get_material(material_id, user_id)
        
        allowed_fields = {'title', 'subject', 'tags', 'description', 'deleted'}
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
        filtered_data['updatedAt'] = datetime.now(timezone.utc).isoformat()
        
        return db_service.update_material(material_id, filtered_data)

    def delete_material(self, material_id, user_id):
        # Soft delete
        self.update_material(material_id, user_id, {"deleted": True})
        return True

    def restore_material(self, material_id, user_id):
        # Restore soft-deleted material
        self.update_material(material_id, user_id, {"deleted": False})
        return True

    def purge_material(self, material_id, user_id):
        # Hard delete
        mat = self.get_material(material_id, user_id)
        if os.path.exists(mat['storagePath']):
            os.remove(mat['storagePath'])
        db_service.delete_material(material_id)
        return True

materials_service = MaterialsService()
