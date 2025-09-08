import os

class UserRouter:
    """
    We want to separate the users app database
    from the products app database.
    """
    
    route_app_labels = {'users', 'admin', 'auth', 'contenttypes', 'sessions'}

    DEFAULT_DB_ALIAS = 'default'  # Default database for other apps
    USER_DB_ALIAS = 'user_db'

    def db_for_read(self, model, **hints):
        """
        Directs read operations for User model to the user_db.
        """
        # print(f"db_for_read: model={model._meta.app_label}.{model._meta.model_name}")
        if model._meta.app_label in self.route_app_labels:
            # print(f"db_for_read: Routing {model._meta.app_label} to {self.USER_DB_ALIAS}")
            return self.USER_DB_ALIAS
        # print(f"db_for_read: Routing {model._meta.app_label} to {self.DEFAULT_DB_ALIAS}")
        return self.DEFAULT_DB_ALIAS

    def db_for_write(self, model, **hints):
        """
        Directs write operations for User model to the user_db.
        """
        # print(f"db_for_write: model={model._meta.app_label}.{model._meta.model_name}")
        if model._meta.app_label in self.route_app_labels:
            # print(f"db_for_write: Routing {model._meta.app_label} to {self.USER_DB_ALIAS}")
            return self.USER_DB_ALIAS
        # print(f"db_for_write: Routing {model._meta.app_label} to {self.DEFAULT_DB_ALIAS}")
        return self.DEFAULT_DB_ALIAS

    def allow_relation(self, obj1, obj2, **hints):
        """
        Allow relations if a model in the users app is involved.
        """
        
        is_obj1_user_related = obj1._meta.app_label in self.route_app_labels
        is_obj2_user_related = obj2._meta.app_label in self.route_app_labels
        
        
        if is_obj1_user_related and is_obj2_user_related:
            return True # Both are user-related, stay in user_db
        if not is_obj1_user_related and not is_obj2_user_related:
            return True # Both are NOT user-related, stay in default db
        
        # If one is user-related and the other is not, forbid the relation
        return False
    
    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Ensure that the users app only migrates to the user_db.
        """
        if app_label in self.route_app_labels:
            return db == self.USER_DB_ALIAS
        return db == self.DEFAULT_DB_ALIAS