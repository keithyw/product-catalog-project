from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Asset, AssetAssociation
from categories.models import Category, CategorySystem

User = get_user_model()


class AssetViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)

        self.asset1 = Asset.objects.create(
            name='Image 1',
            url='https://example.com/image1.jpg',
            type='image'
        )
        self.asset2 = Asset.objects.create(
            name='Document 1',
            url='https://example.com/doc1.pdf',
            type='document'
        )
        self.list_url = reverse('asset-list')
        self.detail_url = reverse('asset-detail', kwargs={'pk': self.asset1.pk})

    def test_list_assets_authenticated(self):
        """
        Ensure authenticated users can list assets.
        """
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
        self.assertEqual(len(response.data['results']), 2)

    def test_list_assets_unauthenticated(self):
        """
        Ensure unauthenticated users cannot list assets.
        """
        self.client.logout()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_retrieve_asset(self):
        """
        Ensure authenticated users can retrieve a single asset.
        """
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], self.asset1.name)

    def test_create_asset(self):
        """
        Ensure authenticated users can create a new asset.
        """
        data = {
            'name': 'New Video',
            'url': 'https://example.com/video.mp4',
            'type': 'video'
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Asset.objects.count(), 3)
        self.assertEqual(Asset.objects.latest('id').name, 'New Video')

    def test_create_asset_missing_required_field(self):
        """
        Ensure creating an asset with a missing required field fails.
        """
        data = {'name': 'Incomplete Asset', 'type': 'image'}  # Missing URL
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('url', response.data)

    def test_update_asset(self):
        """
        Ensure authenticated users can fully update an asset.
        """
        data = {
            'name': 'Updated Image 1',
            'url': 'https://example.com/image1_updated.jpg',
            'type': 'image',
            'description': 'An updated description.'
        }
        response = self.client.put(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.asset1.refresh_from_db()
        self.assertEqual(self.asset1.name, 'Updated Image 1')
        self.assertEqual(self.asset1.url, 'https://example.com/image1_updated.jpg')
        self.assertEqual(self.asset1.description, 'An updated description.')

    def test_partial_update_asset(self):
        """
        Ensure authenticated users can partially update an asset.
        """
        data = {'description': 'A new description has been added.'}
        response = self.client.patch(self.detail_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.asset1.refresh_from_db()
        self.assertEqual(self.asset1.description, 'A new description has been added.')
        self.assertEqual(self.asset1.name, 'Image 1')  # Should not change

    def test_delete_asset(self):
        """
        Ensure authenticated users can delete an asset.
        """
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Asset.objects.count(), 1)
        self.assertFalse(Asset.objects.filter(pk=self.asset1.pk).exists())


class AssetAssociationViewSetTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password123')
        self.client.force_authenticate(user=self.user)

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
            owner=self.owner_obj
        )

        self.list_url = reverse('asset-association-list')
        self.detail_url = reverse('asset-association-detail', kwargs={'pk': self.association.pk})

    def test_list_associations_authenticated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['asset'], self.asset.pk)
        self.assertIsNotNone(response.data['results'][0]['owner_details'])

    def test_create_association(self):
        new_owner = self.owner_obj.add_child(name="New Child Category", category_system=self.category_system)
        data = {
            'asset': self.asset.pk,
            'entity': f"{new_owner._meta.app_label}.{new_owner._meta.model_name}",
            'entity_id': new_owner.pk
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AssetAssociation.objects.count(), 2)

    def test_create_duplicate_association_fails(self):
        data = {
            'asset': self.asset.pk,
            'entity': f"{self.owner_obj._meta.app_label}.{self.owner_obj._meta.model_name}",
            'entity_id': self.owner_obj.pk
        }
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('unique', str(response.data))

    def test_delete_association(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(AssetAssociation.objects.count(), 0)
