from importlib import import_module
from typing import Type

# event should pass in a type rather
# than rely on the setings
def get_messenger():
    from django.conf import settings
    messenger_class_path = getattr(settings, 'MESSENGER_CLASS', None)
    
    if not messenger_class_path:
        raise ImportError("MESSENGER_CLASS not defined in settings.py")
    
    try:
        module_path, class_name = messenger_class_path.rsplit('.', 1)
        module = import_module(module_path)
        messenger_class: Type = getattr(module, class_name)
        return messenger_class()
    except (ImportError, AttributeError) as e:
        raise ImportError(
            f"Could not load messenger class '{messenger_class_path}'. Error: {e}"
        )