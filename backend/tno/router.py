class CatalogRouter:

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        """
        Make sure the catalog db not receive migrate.
        """
        if db == 'catalog':
            return False
        return None
