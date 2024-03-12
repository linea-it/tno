# LIneA Occultation Predictions Database API

## Introduction

The LIneA Occultation Prediction Database (LOPD) API is a solution for querying and managing predictions of stellar occultations programatically. With this API, you can:

- Search for occultation prediction events by various parameters such as date, time, magnitude.
- Customize and filter occultation prediction events based on date/time intervals, magnitude limits, object names, dynamical classes, and subclasses.
- Access geolocation filtering (experimental) for refined results, among other things.
- Query asteroids properties, and more.


The LOPD API is intended for developers, researchers, and enthusiasts looking to integrate or explore book data quickly and easily. The API uses the JSON format for requests and responses, adhering to RESTful standards for architecture and design.

In addition to providing the schema in the OpenAPI standard, this API also offers Swagger UI and ReDoc interfaces. These interfaces are tools that allow for interactive and user-friendly visualization and testing of the API.

Swagger UI is a tool that provides an interactive and user-friendly interface, enabling the execution of requests and viewing of API responses.

ReDoc is a tool that offers an elegant and responsive interface, allowing navigation through the API documentation.

You can access the interfaces via the URL /docs/, selecting the desired option in the top right corner of the page.

- OpenApi Schema: [/api/schema](https://solarsystem.linea.org.br/api/schema)
- Swagger UI: [/api/docs/](https://solarsystem.linea.org.br/api/docs/)
- ReDoc: [api/redoc/](https://solarsystem.linea.org.brapi/redoc/)

> **Warning**
>
>The current version of the LOPD API is 1.0.0. The API is in the development phase and may undergo changes without prior notice. To stay updated on API updates and news, visit the [repository](https://github.com/linea-it/tno) of the API.

## Terms of Use

To use the LOPD API, you must agree to the following terms of use:

<!--- You must register with the API and obtain a valid and unique API key for each application using the API.-->
- Use the API responsibly and ethically.
- Limit the number of API requests to 1000 per day and 100 per hour. If you require a higher limit, contact API support.
- Aknowledge the API as the source of the data used or displayed in your application, including a link to the API documentation.
- Notify API support of any issues, errors, or failures encountered while using the API.
- Accept that the API provides no guarantee of availability, quality, accuracy, or security of the data, and you are solely responsible for the use and consequences of the API in your application.

By using the LOPD API, you declare that you have read, understood, and agreed to the above terms of use. Non-compliance with the terms of use may result in the suspension or cancellation of your access to the API.

<!-- ## Authentication

To access the LOPD API, you need to authenticate with a valid and unique API key for each application using the API. The API key is a 32-character alphanumeric token that identifies and authorizes your application to use the Books API.

To obtain your API key, you must register with the LOPD API, providing your name, email, and the name of your application. After registration, you will receive an email with your API key and a link to activate your account. You can manage your API keys in your user area on the LOPD API.

To use your API key, include it in the `Authorization` header of each request to the Books API, using the format `Bearer <API key>`. For example:

```http
GET /api/occultations?name=Chiron HTTP/1.1
Host: solarsystem.linea.org.br
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXYiLCJhcHBfbmFtZSI6Ik1pbmhhQXBwIiwidXNlcl9pZCI6IjU2Nzg5MDEyMzQiLCJpYXQiOjE2MjEwMjM0NTZ9.4kGkqBS8wXTz6tHwzZYkNzYkNzYkNzYkNzYkNzYkNzY
```

The API key is personal and non-transferable, and should not be shared with third parties. You are solely responsible for the use and security of your API key. If you suspect that your API key has been compromised, you should immediately change or revoke it in your user area on the LOPD API. -->

## Resources

The LOPD API handles the following features:

- **Occultation**: It is an event that contains information regarding the occulting object, such as date and time, apparent magnitude, geocentric distance, etc. Additionally, it provides information about the candidate star to be occulted, such as right ascension, declination, apparent magnitude, etc. Moreover, it includes predictive information about the event, such as the expected drop in magnitude during the occultation, among other data.
- **Asteroid**: Aggregates the set of information about a small body in the Solar System, including its orbital properties and, when available, some physical properties.
- **Base Dynclass**: Contains the main dynamic classifications of asteroids as defined by [Skybot](https://ssp.imcce.fr/webservices/skybot/).
- **Dynclass**: Contains the set of dynamic subclassifications of asteroids as defined by [Skybot](https://ssp.imcce.fr/webservices/skybot/).


## Endpoints


The LOPD API features the following endpoints, organized by categories:

### Occultations

-   **GET /api/occultations**: Returns a list of occultation predictions, which can be filtered by object, date, among other parameters.
-   **GET /api/occultations/{id}**: Returns the details of a specific occultation prediction identified by its ID.
-   **GET /api/occultations/{id}/get_or_create_map**: Returns the details of the map for a specific occultation prediction, generating the map if it doesn't exist.
-   **GET /api/occultations/asteroids_with_prediction**: Returns the list of asteroids with predictions in the database.
-   **GET /api/occultations/dynclass_with_prediction**: Returns the list of dynamic subclasses (Skybot) of asteroids with predictions in the database.
-   **GET /api/occultations/base_dynclass_with_prediction**: Returns the list of base dynamic classes (Skybot) of asteroids with predictions in the database.

### Asteroids

-   **GET /api/asteroids**: Returns the list of asteroids registered in the database.
-   **GET /api/asteroids/{id}**: Returns the details of an asteroid identified by its ID.
-   **GET /api/asteroids/count**: Returns the number of asteroids registered in the database.
-   **GET /api/asteroids/dynclasses**: Returns the list of dynamic subclasses (Skybot) of asteroids registered in the database.
-   **GET /api/asteroids/base_dynclasses**: Returns the list of base dynamic classes (Skybot) of asteroids registered in the database.
-   **GET /api/asteroids/with_prediction**: Returns the list of asteroids registered in the database with occultation prediction and their details.

## Examples

Below are provided some practical examples of using the LOPD API, demonstrating how to perform common or complex operations with the resources and endpoints. The examples are presented in JSON format and using the `curl` command to make requests.


```bash
curl -X GET "https://solarsystem.linea.org.br/api/asteroids/with_prediction"
```

A resposta será uma lista de livros que correspondem ao gênero pesquisado, com os seus respectivos IDs, títulos, autores e capas. Por exemplo:

```json
[
  {
    "id": 1,
    "title": "O Guia do Mochileiro das Galáxias",
    "author": "Douglas Adams",
    "cover": "https://minhaapp.com/covers/1.jpg"
  },
  {
    "id": 2,
    "title": "1984",
    "author": "George Orwell",
    "cover": "https://minhaapp.com/covers/2.jpg"
  },
  {
    "id": 3,
    "title": "Neuromancer",
    "author": "William Gibson",
    "cover": "https://minhaapp.com/covers/3.jpg"
  }
]
```

### Visualizar os detalhes de um livro

Para visualizar os detalhes de um livro, você pode usar o endpoint `GET /books/{id}` com o ID do livro desejado. Por exemplo, para visualizar os detalhes do livro com o ID 1, você pode usar o seguinte comando:

```bash
curl -X GET "https://minhaapp.com/books/1" -H "Authorization: Bearer <API key>"
```

A resposta será um objeto com os dados do livro, como o título, o autor, o gênero, o ano, o ISBN, a sinopse, a avaliação, o número de páginas e a capa. Por exemplo:

```json
{
  "id": 1,
  "title": "O Guia do Mochileiro das Galáxias",
  "author": "Douglas Adams",
  "genre": "Ficção científica",
  "year": 1979,
  "isbn": "9788576573135",
  "synopsis": "Arthur Dent é um típico inglês que, num dia que parecia normal, descobre que a Terra vai ser destruída para dar lugar a uma estrada intergaláctica. Ele é salvo por seu amigo Ford Prefect, que revela ser um alienígena disfarçado. Juntos, eles embarcam em uma viagem pelo universo, conhecendo lugares e seres incríveis, guiados pelo livro mais extraordinário já escrito: o Guia do Mochileiro das Galáxias.",
  "rating": 4.5,
  "pages": 208,
  "cover": "https://minhaapp.com/covers/1.jpg"
}
```

## Errors

The LOPD API can return the following errors, specifying the error codes and messages:

-   **400 Bad Request**: The request was malformed or invalid, for example, missing a required parameter or using an incorrect format.
-   **401 Unauthorized**: The request was not authenticated, for example, missing or using an invalid API key.
-   **403 Forbidden**: The request was authenticated, but does not have permission to access the requested resource, for example, trying to edit or remove a book that does not belong to your personal collection.
-   **404 Not Found**: The requested resource was not found, for example, using a nonexistent ID or an invalid route.
-   **405 Method Not Allowed**: The HTTP method used in the request is not supported by the requested resource, for example, using the POST method on an endpoint that only accepts the GET method.
-   **429 Too Many Requests**: The request exceeded the limit of requests allowed by the API, for example, making more than 1000 requests per day or more than 100 requests per hour.
-   **500 Internal Server Error**: The request caused an internal error on the API server, for example, due to a bug or application failure.
-
<!-- Occultation FilterSet

Data Range = http://localhost/api/occultations/?date_time_after=2023-10-03&date_time_before=2023-10-04

Date Min-Only = http://localhost/api/occultations/?date_time_after=2023-10-03

Data Max-Only = http://localhost/api/occultations/?date_time_before=2023-10-04

Asteroid Name In (exact) = http://localhost/api/occultations/?name=Chiron,Eris

Asteroid Search by Name(icontains) = http://localhost/api/occultations/?search=Chiron

Asteroid Search by Number (icontains) = http://localhost/api/occultations/?search=2060

Asteroid Name (iexact ?)

Asteroid Dynclass iexact = http://localhost/api/occultations/?dynclass=KBO>Resonant>5:2

Asteroid Base Dynclass iexact = http://localhost/api/occultations/?base_dynclass=KBO

Magnitude Range = http://localhost/api/occultations/?mag_g_min=4&mag_g_max=14

Magnitude Min Only = http://localhost/api/occultations/?mag_g_min=4

Magnitude Max Only = http://localhost/api/occultations/?mag_g_max=14

Geo Filter Boolean

User Position Only: http://localhost/api/occultations/?lat=-22.90278&long=-43.2075&radius=500

User Position and Period: http://localhost/api/occultations/?date_time_after=2023-08-01&
date_time_before=2023-08-30&lat=-22.90278&long=-43.2075&radius=500

Nightside Boolean: http://localhost/api/occultations/?nightside=True -->
