# Product Catalog App

## Description

Flexible schema for designing products and managing their inventory. Currently, handles user management/groups and permissions, brands, categories and product management with pricing rules and simple inventory trackign. Limited asset management (e.g. images) is
provided.

Additional tools include AI generation for brands, categories and products/data.

## Requirements

- Python 3.12
- Mysql (I use Docker and the docker-compose.yml contains the image to use)
- Redis (I use Docker and the docker-compose.yml contains the image to use)
- PubSub (I use the gcloud emulator)
- Google Cloud Functions (I use the gcloud emulator)
- Docker (locally if you want to use the docker-compose.yml portions)
- A gemini API key

## Structure

- product_catalog_app
  - python backend
  - uses Django Rest Framework (DRF)
  - models use django-cachalot
  - uses serializers to handle API responses and validate requests
  - AI tools use Google Agent Kid and GenAI packages
  - Categories are hierarchical and uses django-treebeard
  - REST Modules
    - assets (handles uploading/CRUD for assets like images)
    - ai_tools (contains AI tools for generating data)
    - brands (brand API)
    - categories (category API)
    - inventory (inventory API)
    - prices (prices, modifiers and rules API)
    - products (product, product types, attributes and generative APIs)
    - users (users, permissions and groups API; custom version of default django auth)
  - agent_tools (generic RAG tools like Google Search wrappers)
  - agents (base code for agent management)
  - commands (Command design pattern and suppose functions for agents and genai)
  - containers (custom Depdendency Injection layer that can be used for non-Django code and getting access to Django or other services like logging, pubsub, etc.)
  - core (generic code like utils)
  - functions (contains Google Cloud Functions for background processing)
  - messaging (base messaging management code; deprecated)
  - pubsub (base pubsub management code; should be the current one)
  - scripts (contains scripts for one-off tasks)
- frontend/web
  - React/Next.js frontend
  - main stack components are:
    - Next.js
    - TailwindCSS
    - Zod 4 (validation)
    - headlessui
    - heroicons
    - react-hook-form
    - storybook
    - typescript

Test
