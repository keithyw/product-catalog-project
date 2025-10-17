from django.template.loader import get_template

def render(template: str, data: dict) -> str:
    try:
        t = get_template(template)
    except Exception as e:
        raise ValueError(f"Cannot find template {template}. Error: {e}")
    return t.render(data).strip()