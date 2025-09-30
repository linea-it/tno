# Worker de Processamento de Tasks

Este projeto implementa um worker Python utilizando SQLAlchemy para processar tasks de uma tabela Django PostgreSQL. Ele é projetado para ser executado em um ambiente Docker, permitindo múltiplas instâncias e a execução de scripts específicos para cada estado de task.

## Estrutura do Projeto

```
.
├── docker-compose.yml
└── worker_app/
    ├── Dockerfile
    ├── main.py
    ├── requirements.txt
    ├── base_worker.py
    └── task_scripts/
        ├── __init__.py  (Opcional, para pacotes Python)
        ├── pending_task.py
        └── completed_task.py
```

## Requisitos

- Docker e Docker Compose instalados.
- Um banco de dados PostgreSQL acessível.

## Configuração

### 1. Variáveis de Ambiente

O worker utiliza as seguintes variáveis de ambiente:

- `DATABASE_URL`: URL de conexão com o banco de dados PostgreSQL (ex: `postgresql://user:password@db:5432/mydatabase`).
- `WORKER_STATE_SCRIPT`: O estado da task que esta instância específica do worker deve processar (ex: `PENDING`, `RUNNING`, `COMPLETED`). Isso permite que diferentes workers se concentrem em diferentes fases do ciclo de vida da task.
- `WORKER_NAME`: Um nome único para a instância do worker. Essencial para o registro de heartbeat.

### 2. `docker-compose.yml`

O arquivo `docker-compose.yml` orquestra o banco de dados PostgreSQL e o serviço do worker. Um exemplo de configuração é fornecido:

```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: mydatabase
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  worker_pending:
    build: ./worker_app
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/mydatabase
      WORKER_STATE_SCRIPT: PENDING
      WORKER_NAME: worker_pending_1
    depends_on:
      - db
    deploy:
      replicas: 1

  worker_running:
    build: ./worker_app
    environment:
      DATABASE_URL: postgresql://user:password@db:5432/mydatabase
      WORKER_STATE_SCRIPT: RUNNING
      WORKER_NAME: worker_running_1
    depends_on:
      - db
    deploy:
      replicas: 1

volumes:
  db_data:
```

- **`db`**: Serviço PostgreSQL para o banco de dados.
- **`worker_pending` / `worker_running`**: Serviços do worker Python. Note que agora cada serviço pode ser configurado para um `WORKER_STATE_SCRIPT` e `WORKER_NAME` específico.
  - `build: ./worker_app`: Constrói a imagem Docker a partir do `Dockerfile` localizado em `worker_app/`.
  - `environment`: Define as variáveis de ambiente para o container do worker.
  - `deploy.replicas`: Define o número de instâncias do worker a serem executadas. Você pode ajustar isso conforme a necessidade.

## Como Executar

1.  **Construir e Iniciar os Serviços:**

    Navegue até o diretório raiz do projeto (onde `docker-compose.yml` está localizado) e execute:

    ```bash
    docker-compose up --build -d
    ```

    Isso construirá a imagem do worker e iniciará o banco de dados e as instâncias do worker em segundo plano.

2.  **Verificar os Logs:**

    Para ver os logs dos workers e do banco de dados:

    ```bash
    docker-compose logs -f
    ```

3.  **Parar os Serviços:**

    Para parar e remover os containers:

    ```bash
    docker-compose down
    ```

## Arquitetura do Worker

O projeto agora utiliza uma classe `BaseWorker` (`worker_app/base_worker.py`) que encapsula a lógica comum a todos os workers, incluindo:

-   **Conexão com o Banco de Dados**: Gerencia a conexão SQLAlchemy.
-   **Logging Individual**: Cada instância de worker possui seu próprio logger, facilitando a identificação de logs por worker.
-   **Gerenciamento de Tasks**: Métodos como `get_next_task` (com `FOR UPDATE SKIP LOCKED`) e `update_task_status` para interagir com a tabela `predictiontask`.
-   **Heartbeat**: Um mecanismo para registrar a atividade do worker na tabela `workersheartbeat`.

### `BaseWorker`

A classe `BaseWorker` é a base para qualquer worker. Ela inicializa a conexão com o banco de dados, configura um logger com o nome do worker e gerencia o heartbeat. As subclasses devem implementar o método `run()`.

### `PredictionTask` e `WorkersHeartbeat` Models

Os modelos SQLAlchemy para `predictiontask` e `workersheartbeat` estão definidos em `base_worker.py`.

### `main.py`

O `main.py` agora contém a classe `TaskProcessorWorker` que herda de `BaseWorker`. Ele é responsável por:

-   Inicializar a `BaseWorker` com um nome e o estado de task a ser processado.
-   Implementar o loop principal que busca tasks, carrega e executa scripts específicos para o estado da task, e atualiza o status da task.

## Adicionando Novos Scripts de Task

Para adicionar um novo script para um estado de task diferente (ex: `PROCESSING`):

1.  Crie um novo arquivo Python dentro de `worker_app/task_scripts/` com o nome `processing_task.py`.
2.  Implemente uma função `execute(task, db_session, worker)` dentro deste arquivo. Esta função receberá o objeto `task` (modelo SQLAlchemy), a sessão do banco de dados e a instância do `worker` (para acesso ao logger e métodos de task).

    Exemplo de `processing_task.py`:

    ```python
    import logging

    def execute(task, db_session, worker):
        worker.log.info(f"Executando script 'processing_task' para a task {task.id}.")
        # Lógica específica para o estado PROCESSING
        # ...
        worker.update_task_status(db_session, task, "COMPLETED") # Ou outro estado
        worker.log.info(f"Task {task.id} atualizada para COMPLETED pelo script 'processing_task'.")
        return True
    ```

3.  No seu `docker-compose.yml`, você pode configurar uma nova instância de worker para processar tasks com o estado `PROCESSING`:

    ```yaml
    # ... (outros serviços)

    worker_processing:
      build: ./worker_app
      environment:
        DATABASE_URL: postgresql://user:password@db:5432/mydatabase
        WORKER_STATE_SCRIPT: PROCESSING
        WORKER_NAME: worker_processing_1
      depends_on:
        - db
      deploy:
        replicas: 1
    ```

## Interação com o Banco de Dados (SQLAlchemy)

O `base_worker.py` define os modelos `PredictionTask` e `WorkersHeartbeat` que mapeiam as tabelas correspondentes no PostgreSQL. A conexão é estabelecida via SQLAlchemy, e as tasks são selecionadas usando `FOR UPDATE SKIP LOCKED` para garantir que múltiplas instâncias do worker possam operar em paralelo sem conflitos. O heartbeat é atualizado periodicamente na tabela `workersheartbeat`.

## Testando

Para testar o sistema, você precisará de uma aplicação Django (ou qualquer outra forma) para popular a tabela `predictiontask` com tasks no estado `PENDING`. Os workers irão então pegar e processar essas tasks.

Certifique-se de que o esquema do banco de dados para as tabelas `predictiontask` e `workersheartbeat` esteja criado no PostgreSQL antes de iniciar os workers. Em um projeto Django, isso geralmente é feito com `python manage.py migrate`.

Este setup fornece uma base robusta para um sistema de processamento de tasks distribuído e escalável.

