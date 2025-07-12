from django.test import TestCase
from rest_framework.exceptions import ValidationError
from products.models import Product
from products.serializers import ProductSerializer

class ProductSerializerTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="test1",
            description="test1 desc"
        )
        self.valid_data = {
            'name': 'new valid product',
            'description': 'new valid product desc',
        }
        self.valid_data_no_desc = {
            'name': 'pork sausage',
            'description': None
        }
        self.invalid_data_short_name = {
            'name': '11',
            'description': 'bleh',
        }
        self.invalid_data_empty_name = {
            'name': '',
            'description': 'empty desc',
        }
        
    def test_valid_product_serialization(self):
        """
        Test for valid product data
        """
        serializer = ProductSerializer(instance=self.product)
        self.assertIn('name', serializer.data)
        self.assertIn('description', serializer.data)
        self.assertIn('id', serializer.data)
        self.assertEqual(serializer.data['name'], self.product.name)
        self.assertEqual(serializer.data['description'], self.product.description)
        
    def test_valid_product_creation(self):
        """
        Test create valid product 
        """
        serializer = ProductSerializer(data=self.valid_data)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        product = serializer.save()
        self.assertEqual(product.name, self.valid_data['name'])
        self.assertEqual(product.description, self.valid_data['description'])
        self.assertIsNotNone(product.id)
        
    def test_valid_product_creation_no_description(self):
        """
        Test product with no description for creation
        """
        serializer = ProductSerializer(data=self.valid_data_no_desc)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        product = serializer.save()
        self.assertEqual(product.name, self.valid_data_no_desc['name'])
        self.assertIsNone(product.description)
        
    def test_invalid_product_creation_short_name(self):
        """
        Test product creation failure with short name
        """
        serializer = ProductSerializer(data=self.invalid_data_short_name)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
        self.assertIn('Ensure this field has at least 3 characters.', str(serializer.errors['name']))
    
    def test_invalid_product_creation_empty_name(self):
        """
        Test product creation failure with empty name
        """
        serializer = ProductSerializer(data=self.invalid_data_empty_name)
        self.assertFalse(serializer.is_valid())
        self.assertIn('name', serializer.errors)
        self.assertIn('This field may not be blank.', str(serializer.errors['name']))
        
    def test_read_only_fields_not_writable(self):
        """
        Test product creation for fields that are read-only
        """
        data = {
            'name': 'blorf',
            'description': 'whatevz',
            'created_at': '2025-01-01T00:00:00Z',
            'updated_at': '2025-01-01T00:00:00Z'
        }
        
        serializer = ProductSerializer(instance=self.product, data=data, partial=True)
        self.assertTrue(serializer.is_valid(raise_exception=True))
        product = serializer.save()
        self.assertEqual(product.name, data['name'])
        self.assertEqual(product.description, data['description'])
        self.assertNotEqual(product.created_at.isoformat(), '2025-01-01T00:00:00Z')