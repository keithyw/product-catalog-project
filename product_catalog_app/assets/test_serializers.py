from django.test import TestCase
from rest_framework.exceptions import ValidationError

from .models import Asset, AssetAssociation
from .serializers import AssetSerializer, AssetAssociationSerializer
from categories.models import Category, CategorySystem


class AssetSerializerTests(TestCase):
    def setUp(self):
        self.asset_data = {
            'name': 'Test Image',
            'url': 'https://example.com/test.jpg',
            'type': 'image',
            'extension': 'jpg',
        }
        self.asset = Asset.objects.create(**self.asset_data)
        self.serializer = AssetSerializer(instance=self.asset)

    def test_serialization_contains_expected_fields(self):
        data = self.serializer.data
        expected_keys = [
            'id', 'name', 'url', 'type', 'filepath', 'extension',
            'dimensions', 'description', 'created_at', 'updated_at'
        ]
        self.assertEqual(set(data.keys()), set(expected_keys))
        self.assertEqual(data['name'], self.asset_data['name'])
        self.assertEqual(data['url'], self.asset_data['url'])

    def test_deserialization_create_valid_data(self):
        valid_data = {
            'name': 'New Asset',
            'url': 'https://example.com/new.png',
            'type': 'image',
        }
        serializer = AssetSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        asset = serializer.save()
        self.assertEqual(asset.name, valid_data['name'])
        self.assertEqual(Asset.objects.count(), 2)

    def test_deserialization_url_is_required(self):
        invalid_data = {
            'name': 'Asset without URL',
            'type': 'document',
        }
        serializer = AssetSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('url', serializer.errors)

    def test_deserialization_url_must_be_unique(self):
        invalid_data = {
            'name': 'Duplicate Asset',
            'url': self.asset_data['url'],  # Use existing URL
            'type': 'image',
        }
        serializer = AssetSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('url', serializer.errors)
        self.assertIn('unique', str(serializer.errors['url'][0]))


class AssetAssociationSerializerTests(TestCase):
    def setUp(self):
        self.asset = Asset.objects.create(
            name='Associated Image',
            url='https://example.com/associated.jpg',
            type='image'
        )
        self.category_system = CategorySystem.objects.create(name='Test System')
        self.owner_obj = Category.add_root(
            name='Test Category Owner',
            category_system=self.category_system
        )
        self.association = AssetAssociation.objects.create(
            asset=self.asset,
            entity=f"{self.owner_obj._meta.app_label}.{self.owner_obj._meta.model_name}",
            entity_id=self.owner_obj.pk
        )

    def test_serialization_with_owner(self):
        serializer = AssetAssociationSerializer(instance=self.association)
        data = serializer.data
        expected_keys = ['id', 'asset', 'entity', 'entity_id', 'owner_details']
        self.assertEqual(set(data.keys()), set(expected_keys))

        owner_details = data['owner_details']
        self.assertIsNotNone(owner_details)
        self.assertEqual(owner_details['id'], self.owner_obj.id)
        self.assertEqual(owner_details['name'], self.owner_obj.name)
        self.assertEqual(owner_details['type'], 'category')

    def test_deserialization_create_valid_data(self):
        new_asset = Asset.objects.create(url='https://example.com/for-assoc.png', type='image')
        valid_data = {
            'asset': new_asset.pk,
            'entity': f"{self.owner_obj._meta.app_label}.{self.owner_obj._meta.model_name}",
            'entity_id': self.owner_obj.pk
        }
        serializer = AssetAssociationSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        instance = serializer.save()
        self.assertEqual(AssetAssociation.objects.count(), 2)
        self.assertEqual(instance.asset, new_asset)
        self.assertEqual(instance.owner, self.owner_obj)