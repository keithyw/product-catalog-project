import os
from datetime import timedelta
from pathlib import Path
# from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env file
# load_dotenv(BASE_DIR.parent / '.env')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
# SECRET_KEY = 'django-insecure-k5-mkq1nb@u4+3gphz9@4a)=skv!u^!jgz9(hha!*n&8ufjy86'

SECRET_KEY = os.getenv('SECRET_KEY')


# DEBUG = True
DEBUG = bool(os.getenv('DEBUG', default=0))

# Default
# ALLOWED_HOSTS = []

ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '127.0.0.1').split(',')

# For production
# CORS_ALLOWED_ORIGINS = [
#     'http://localhost:4000',
#     'http://127.0.0.1:4000',
# ]

# For development
CORS_ALLOW_ALL_ORIGINS = True

# Application definition

INSTALLED_APPS = [
    'core.apps.CoreConfig',
    'ai_tools.apps.AiToolsConfig',
    'assets.apps.AssetsConfig',
    'brands.apps.BrandsConfig',
    'categories.apps.CategoriesConfig',
    'prices.apps.PricesConfig',
    'products.apps.ProductsConfig',
    'users.apps.UsersConfig',
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt',
    'cachalot',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissionsOrAnonReadOnly',
    ],
}

ROOT_URLCONF = 'product_catalog_app.urls'

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(seconds=int(os.getenv('JWT_ACCESS_TOKEN_LIFETIME', 3600))),  # 1 hour
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),  # 30 days
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    # Remove TOKEN_USER_CLASS to use the actual User model with groups/permissions
    # 'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'functions/prompts',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'product_catalog_app.wsgi.application'

CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.getenv('REDIS_URL', 'redis://127.0.0.1:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

CACHALOT_ENABLED = True
CACHALOT_TIMEOUT = 300

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MYSQL_DATABASE'),
        'USER': os.getenv('MYSQL_USER'),
        'PASSWORD': os.getenv('MYSQL_PASS'),
        'HOST': os.getenv('MYSQL_HOST', 'localhost'),
        'PORT': os.getenv('MYSQL_PORT', '33006'),
    },
    'user_db': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('USER_DB_NAME'),
        'USER': os.getenv('MYSQL_USER'),
        'PASSWORD': os.getenv('MYSQL_PASS'),
        'HOST': os.getenv('MYSQL_HOST', 'localhost'),
        'PORT': os.getenv('MYSQL_PORT', '33006'),
    }
}

DATABASE_ROUTERS = ['users.db_router.UserRouter']

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTH_USER_MODEL = 'users.User'

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
GEMINI_API_VERSION = 'v1alpha'
GEMINI_MODEL = 'gemini-2.0-flash-001'
GEMINI_SEARCH_MODEL = 'gemini-2.5-flash'
GOOGLE_CLOUD_PROJECT = os.getenv('GOOGLE_CLOUD_PROJECT')
GEMINI_PROJECT_ID = os.getenv('GEMINI_PROJECT_ID')

MESSENGER_CLASS = 'messaging.google.GooglePubSubClient'

PUBSUB_EMULATOR_HOST = os.getenv('PUBSUB_EMULATOR_HOST', 'localhost:8085')
PUBSUB_PROJECT_ID = os.getenv('PUBSUB_PROJECT_ID', 'my-project-id')
PUBSUB_TIMEOUT = 300

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': True,
        },
        'products': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        }
    },
}

FILE_UPLOAD_TEMP_DIR = '/tmp'

LOGFILE = '/tmp/product.catalog.log'