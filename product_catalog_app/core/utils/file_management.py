import os
import uuid
from datetime import datetime
from django.conf import settings
from django.core.files.uploadedfile import UploadedFile
import logging

logger = logging.getLogger(__name__)

# --- Configuration Helpers ---

def get_media_root():
    """Returns the configured MEDIA_ROOT or a safe default."""
    # Assuming MEDIA_ROOT is available in Django settings
    return getattr(settings, 'MEDIA_ROOT', os.path.join(settings.BASE_DIR, 'media'))

def get_media_url():
    """Returns the configured MEDIA_URL or a safe default."""
    # Assuming MEDIA_URL is available in Django settings
    return getattr(settings, 'MEDIA_URL', '/media/')

# --- Core Logic ---

def get_extension(file) -> str:
    _, extension = os.path.splitext(file)
    if not extension.startswith('.'):
        extension = '.' + extension
    return extension
    
def generate_asset_filepath(file_type: str, original_filename: str) -> str:
    """
    Generates a unique, structured relative filepath for an asset:
    <asset_type>/<year>/<month>/<day>/<uuid>.<extension>

    :param file_type: The type of file (e.g., 'image', 'document', 'video').
    :param original_filename: The original name of the uploaded file.
    :return: The relative path to the file from MEDIA_ROOT.
    """
    now = datetime.now()
    
    # 1. Normalize file_type to a safe, lowercase directory name
    safe_type = file_type.lower().strip().replace(' ', '_').replace('/', '_')
    if not safe_type:
        safe_type = 'misc'
        
    extension = get_extension(original_filename)

    # 3. Create the relative directory structure
    date_path = now.strftime('%Y/%m/%d')
    
    # 4. Generate a unique filename using UUID
    unique_filename = f"{uuid.uuid4()}{extension}"
    
    # The final relative filepath
    relative_dir = os.path.join(safe_type, date_path)
    relative_filepath = os.path.join(relative_dir, unique_filename)
    
    return relative_filepath

def save_uploaded_file(uploaded_file: UploadedFile, file_type: str) -> dict:
    """
    Handles saving the uploaded file to the filesystem, creating directories as needed.

    :param uploaded_file: The uploaded file object (e.g., from request.FILES).
    :param file_type: The determined type of the file (e.g., 'image').
    :return: A dictionary containing the 'filepath' (relative) and 'url' (absolute)
             of the saved file.
    """
    media_root = get_media_root()
    media_url_base = get_media_url()
    
    # 1. Generate the unique relative path
    relative_filepath = generate_asset_filepath(file_type, uploaded_file.name)
    
    # 2. Construct the full absolute path
    full_filepath = os.path.join(media_root, relative_filepath)
    
    # 3. Create necessary directories
    os.makedirs(os.path.dirname(full_filepath), exist_ok=True)
    
    # 4. Save the file chunks (using Django's efficient file handling)
    try:
        with open(full_filepath, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
    except Exception as e:
        logger.error(f"Error saving file to {full_filepath}: {e}")
        raise

    # 5. Construct the final URL
    # Replace os.path.sep with '/' for correct URL structure
    asset_url = os.path.join(media_url_base, relative_filepath).replace(os.path.sep, '/')

    return {
        'filepath': relative_filepath,
        'extension': get_extension(uploaded_file.name),
        'url': asset_url,
    }

def delete_asset_file(relative_filepath: str):
    """
    Deletes an asset file from the filesystem and attempts to clean up empty directories.

    :param relative_filepath: The relative path of the file to delete (from Asset.filepath).
    """
    if not relative_filepath:
        return
        
    media_root = get_media_root()
    full_filepath = os.path.join(media_root, relative_filepath)
    
    if os.path.exists(full_filepath):
        try:
            os.remove(full_filepath)
            logger.info(f"Successfully removed file: {full_filepath}")
        except OSError as e:
            logger.error(f"Could not remove file {full_filepath}: {e}")
            return

    # Attempt to clean up empty date/type directories (optional but good practice)
    try:
        dir_path = os.path.dirname(full_filepath)
        # Try removing up to 3 parent directories (day, month, year)
        for _ in range(3): 
            # Check if the directory is now empty
            if os.path.exists(dir_path) and not os.listdir(dir_path):
                os.rmdir(dir_path)
                dir_path = os.path.dirname(dir_path)
            else:
                break
    except OSError as e:
        # Ignore if directory is not empty, permission denied, or other cleanup failure
        logger.debug(f"Directory cleanup aborted or failed: {e}")
        pass