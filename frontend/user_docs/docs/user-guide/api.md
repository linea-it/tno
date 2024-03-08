# Solar System API

## Introdução

A API de Livros é uma solução que permite consultar e gerenciar livros em uma biblioteca online. Com a API de Livros, você pode:

- Pesquisar livros por título, autor, gênero, ano ou ISBN
- Visualizar os detalhes de cada livro, como sinopse, avaliação, número de páginas e capa
- Adicionar, editar ou remover livros da sua coleção pessoal
- Comentar, avaliar ou recomendar livros para outros usuários
- Acessar estatísticas e recomendações personalizadas de livros

A API de Livros é destinada a desenvolvedores, pesquisadores e entusiastas que querem integrar ou explorar os dados de livros de forma simples e rápida. A API de Livros usa o formato JSON para as requisições e as respostas, e segue os padrões RESTful para a arquitetura e o design.

Esta API além de disponibilizar o schema no padrão OpenAPI disponibiliza também as interfaces Swagger UI e ReDoc. Essas interfaces são ferramentas que permitem visualizar e testar a API de forma interativa e amigável.

O Swagger UI é uma ferramenta que oferece uma interface interativa e amigável, que permite executar requisições e ver as respostas da sua API.

O ReDoc é uma ferramenta que oferece uma interface elegante e responsiva, que permite navegar pela documentação da API.

Você pode acessar as interfaces pela URL /docs/, escolhendo a opção desejada no canto superior direito da página.

- OpenApi Schema: [/api/schema](https://solarsystem.linea.org.br/api/schema)
- Swagger UI: [/api/docs/](https://solarsystem.linea.org.br/api/docs/)
- ReDoc: [api/redoc/](https://solarsystem.linea.org.brapi/redoc/)

A versão atual da API de Livros é a 1.0.0, lançada em 01/01/2024. A API de Livros está em fase de desenvolvimento e pode sofrer alterações sem aviso prévio. Para acompanhar as atualizações e as novidades da API de Livros, o [repositório](https://github.com/linea-it/tno) da API.

## Termos de uso

Para usar a API de Livros, você deve concordar com os seguintes termos de uso:

- Você deve se registrar na API de Livros e obter uma chave de acesso (API key) válida e única para cada aplicação que usar a API.
- Você deve usar a API de Livros de forma responsável e ética, respeitando os direitos autorais e a privacidade dos autores e dos usuários dos livros.
- Você deve limitar o número de requisições à API de Livros a 1000 por dia e 100 por hora. Se você precisar de um limite maior, entre em contato com o suporte da API.
- Você deve citar a API de Livros como a fonte dos dados que você usar ou exibir em sua aplicação, incluindo um link para a documentação da API.
- Você deve notificar o suporte da API sobre qualquer problema, erro ou falha que você encontrar ao usar a API de Livros.
- Você deve aceitar que a API de Livros não oferece nenhuma garantia de disponibilidade, qualidade, precisão ou segurança dos dados, e que você é o único responsável pelo uso e pelas consequências da API de Livros em sua aplicação.

Ao usar a API de Livros, você declara que leu, entendeu e concordou com os termos de uso acima. O descumprimento dos termos de uso pode resultar na suspensão ou no cancelamento do seu acesso à API de Livros.

## Autenticação

Para acessar a API de Livros, você precisa se autenticar com uma chave de acesso (API key) válida e única para cada aplicação que usar a API. A API key é um token alfanumérico de 32 caracteres que identifica e autoriza a sua aplicação a usar a API de Livros.

Para obter a sua API key, você deve se registrar na API de Livros, informando o seu nome, e-mail e o nome da sua aplicação. Após o registro, você receberá um e-mail com a sua API key e um link para ativar a sua conta. Você pode gerenciar as suas API keys na sua área de usuário na API de Livros.

Para usar a sua API key, você deve incluí-la no cabeçalho `Authorization` de cada requisição à API de Livros, usando o formato `Bearer <API key>`. Por exemplo:

```http
GET /books?title=Harry+Potter HTTP/1.1
Host: api.livros.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMTIzNDU2Nzg5MGFiY2RlZmdoaWprbG1ub3BxcnN0dXYiLCJhcHBfbmFtZSI6Ik1pbmhhQXBwIiwidXNlcl9pZCI6IjU2Nzg5MDEyMzQiLCJpYXQiOjE2MjEwMjM0NTZ9.4kGkqBS8wXTz6tHwzZYkNzYkNzYkNzYkNzYkNzYkNzY
```

A API key é pessoal e intransferível, e não deve ser compartilhada com terceiros. Você é o único responsável pelo uso e pela segurança da sua API key. Se você suspeitar que a sua API key foi comprometida, você deve alterá-la ou revogá-la imediatamente na sua área de usuário na API de Livros.

## Recursos

A API de Livros manipula os seguintes recursos:

- **Occultations**: Um livro é uma obra literária que contém informações sobre o título, o autor, o gênero, o ano, o ISBN, a sinopse, a avaliação, o número de páginas e a capa. Um livro pode ter vários comentários e recomendações de outros usuários. Um livro pode pertencer ou não à coleção pessoal de um usuário.
- **Asteroids**: Um comentário é uma opinião ou uma crítica de um usuário sobre um livro. Um comentário contém informações sobre o autor, o conteúdo, a data e a avaliação do comentário. Um comentário pode ter respostas de outros usuários.
- **Dynclass**: Uma recomendação é uma sugestão de um usuário para que outro usuário leia um livro. Uma recomendação contém informações sobre o autor, o destinatário, o livro e a data da recomendação. Uma recomendação pode ter respostas de outros usuários.
- **Base Dynclass**: Um usuário é uma pessoa que se registrou na API de

Claro, eu posso adicionar as seções Endpoints, Errors, Exemplos e Referências em markdown. Essas seções são importantes para documentar os detalhes técnicos, os possíveis problemas e as soluções práticas da sua API. Seguindo o template que eu gerei anteriormente, as seções ficariam assim:

## Endpoints

A API de Livros possui os seguintes endpoints, organizados por categorias:

### Occultations

- **GET /api/occultations**: Retorna uma lista de livros, podendo ser filtrada por título, autor, gênero, ano ou ISBN.
- **GET /api/occultations/{id}**: Retorna os detalhes de um livro específico, identificado pelo seu ID. Requer autenticação.
- **GET /api/occultations/{id}/get_or_create_map**: Adiciona um novo livro à coleção pessoal do usuário. Requer autenticação e permissão de escrita.
- **GET /api/occultations/asteroids_with_prediction**: Edita os dados de um livro existente na coleção pessoal do usuário. Requer autenticação e permissão de escrita.
- **GET /api/occultations/dynclass_with_prediction**: Remove um livro da coleção pessoal do usuário. Requer autenticação e permissão de escrita.
- **GET /api/occultations/base_dynclass_with_prediction**: Retorna uma lista de comentários sobre um livro.

### Asteroids

- **GET /api/asteroids**: Retorna uma lista de comentários sobre um livro específico.
- **GET /api/asteroids/{id}**: Retorna os detalhes de um comentário específico, identificado pelo seu ID.
- **GET /api/asteroids/count**: Adiciona um novo comentário sobre um livro específico.
- **GET /api/asteroids/dynclasses**: Retorna uma lista de comentários existente.
- **GET /api/asteroids/base_dynclasses**: Retorna uma lista de comentários existente.
- **GET /api/asteroids/with_prediction**: Requer autenticação e permissão de escrita.

## Exemplos

A seguir, são fornecidos alguns exemplos práticos de uso da API de Livros, mostrando como realizar operações comuns ou complexas com os recursos e os endpoints. Os exemplos são apresentados em formato JSON e usando o comando `curl` para fazer as requisições.

### Pesquisar livros por gênero

Para pesquisar livros por gênero, você pode usar o endpoint `GET /books` com o parâmetro `genre`. Por exemplo, para pesquisar livros de ficção científica, você pode usar o seguinte comando:

```bash
curl -X GET "https://minhaapp.com/books?genre=ficção+científica" -H "Authorization: Bearer <API key>"
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

## Erros

A API de Livros pode retornar os seguintes erros, especificando os códigos e as mensagens dos erros:

- **400 Bad Request**: A requisição foi malformada ou inválida, por exemplo, faltando um parâmetro obrigatório ou usando um formato incorreto.
- **401 Unauthorized**: A requisição não foi autenticada, por exemplo, faltando ou usando uma API key inválida.
- **403 Forbidden**: A requisição foi autenticada, mas não tem permissão para acessar o recurso solicitado, por exemplo, tentando editar ou remover um livro que não pertence à sua coleção pessoal.
- **404 Not Found**: O recurso solicitado não foi encontrado, por exemplo, usando um ID inexistente ou uma rota inválida.
- **405 Method Not Allowed**: O método HTTP usado na requisição não é suportado pelo recurso solicitado, por exemplo, usando o método POST em um endpoint que só aceita o método GET.
- **429 Too Many Requests**: A requisição excedeu o limite de requisições permitido pela API, por exemplo, fazendo mais de 1000 requisições por dia ou mais de 100 requisições por hora.
- **500 Internal Server Error**: A requisição causou um erro interno no servidor da API, por exemplo, devido a um bug ou uma falha na aplicação.

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
