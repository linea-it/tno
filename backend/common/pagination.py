from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardResultsSetPagination(PageNumberPagination):
    """
    Classe personalizada para gerenciar a paginacao.
    http://www.django-rest-framework.org/api-guide/pagination/#pagenumberpagination
    """

    page_size = 100
    page_query_param = "page"
    page_size_query_param = "pageSize"
    max_page_size = 1000

    def get_paginated_response(self, data):

        next_page_number = None
        if self.page.has_next():
            next_page_number = self.page.next_page_number()

        previous_page_number = None
        if self.page.has_previous():
            previous_page_number = self.page.previous_page_number()

        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    # ("next", self.get_next_link()),
                    # ("previous", self.get_previous_link()),
                    ("pageParam", self.page.number),
                    ("next", next_page_number),
                    ("previous", previous_page_number),
                    ("results", data),
                ]
            )
        )
