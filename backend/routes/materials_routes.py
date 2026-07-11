from flask import Blueprint, request, g, send_file
from services.materials_service import materials_service
from middleware.auth_middleware import require_auth
from utils.response import success_response, error_response
import os

materials_bp = Blueprint('materials', __name__)

@materials_bp.route('/upload', methods=['POST'])
@require_auth
def upload():
    if 'file' not in request.files:
        return error_response('BAD_REQUEST', 'No file part')
    
    file = request.files['file']
    try:
        material = materials_service.upload_material(g.user['uid'], file)
        return success_response({"material": material}, 201)
    except ValueError as e:
        return error_response('BAD_REQUEST', str(e))
    except Exception as e:
        return error_response('SERVER_ERROR', "Upload failed: " + str(e), 500)

@materials_bp.route('', methods=['GET'])
@require_auth
def get_materials():
    include_deleted = request.args.get('include_deleted', 'false').lower() == 'true'
    materials = materials_service.get_user_materials(g.user['uid'], include_deleted=include_deleted)
    # Sort by createdAt descending
    materials.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
    return success_response({"materials": materials})

@materials_bp.route('/<material_id>', methods=['GET'])
@require_auth
def get_material(material_id):
    try:
        material = materials_service.get_material(material_id, g.user['uid'])
        return success_response({"material": material})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)

@materials_bp.route('/<material_id>', methods=['PUT'])
@require_auth
def update_material(material_id):
    data = request.get_json() or {}
    try:
        material = materials_service.update_material(material_id, g.user['uid'], data)
        return success_response({"material": material})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)

@materials_bp.route('/<material_id>', methods=['DELETE'])
@require_auth
def delete_material(material_id):
    try:
        materials_service.delete_material(material_id, g.user['uid'])
        return success_response({"message": "Material soft-deleted successfully"})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)

@materials_bp.route('/restore/<material_id>', methods=['POST'])
@require_auth
def restore_material(material_id):
    try:
        materials_service.restore_material(material_id, g.user['uid'])
        return success_response({"message": "Material restored successfully"})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)

@materials_bp.route('/purge/<material_id>', methods=['DELETE'])
@require_auth
def purge_material(material_id):
    try:
        materials_service.purge_material(material_id, g.user['uid'])
        return success_response({"message": "Material permanently deleted"})
    except ValueError as e:
        return error_response('NOT_FOUND', str(e), 404)

@materials_bp.route('/download/<material_id>', methods=['GET'])
# No require_auth for simple downloading via a tag, or add it and use signed URLs
def download(material_id):
    # In a real app we would check auth here if using cookie session, 
    # but for local JSON mock and stateless JWT this is hard. 
    # We will just fetch it directly for the demo.
    try:
        mat = materials_service.get_material(material_id, None) # Hacking auth for demo download
        if mat and os.path.exists(mat['storagePath']):
            return send_file(mat['storagePath'], as_attachment=True, download_name=mat['originalFileName'])
    except ValueError:
        pass
    return error_response('NOT_FOUND', 'File not found', 404)
