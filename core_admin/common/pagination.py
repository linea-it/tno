from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """
        Classe personalizada para gerenciar a paginacao. 
        http://www.django-rest-framework.org/api-guide/pagination/#pagenumberpagination
    """ 
    page_size = 100
    page_query_param = 'page'
    page_size_query_param = 'pageSize'
    max_page_size = 1000