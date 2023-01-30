print("Try Run NIMA")
import docker

client = docker.DockerClient(base_url="tcp://172.19.0.1:2376")

my_image_name = "nima:7"

my_image = None
# Buscando por uma Imagem Expecifica
print("Buscando por uma Imagem Expecifica")
try:
    # OBS na doc nao esta explicito mais parece que no caso de haver mais de uma imagem
    # que atenda a busca, o retorno e a mais recente.
    my_image = client.images.get(my_image_name)

except docker.errors.ImageNotFound as e:
    print("Imagem Nao encontrada Tentando baixar a imagem")

    my_image = client.images.pull(my_image_name)

    print("Imagem Baixada: %s" % (str(my_image)))

except docker.errors.APIError as e:
    print(e)

if my_image:
    print("MY Image:  %s " % (str(my_image)))

    print("Runing a echo in container")
    # OBS: rodar o container sem a opcao detach, o comando vai esperar a execucao do
    # container e retornar o log.
    container_log = client.containers.run(my_image, "echo Hello World")
    print(container_log)

    print("Runing a Sleep to check if container run ")

    cmd = "sleep 15"
    cmd = "python /app/NIMAv7_user/executeNIMAv7.py"
    try:
        container = client.containers.run(
            my_image,
            command=cmd,
            detach=True,
            name="my_container",
            auto_remove=True,
            mem_limit="128m",
            volumes={
                "/home/glauber/tno/archive/proccess/6/objects/1999_RB216": {
                    "bind": "/data",
                    "mode": "rw",
                },
            },
        )

        print(
            "ID: %s Name: %s Image: %s Status: %s"
            % (container.short_id, container.name, container.image, container.status)
        )

        print("Stream Log")
        for line in container.logs(stream=True):
            print(line.strip())

        print("Status: %s" % container.status)

    except docker.errors.ContainerError as e:
        print(e)

    # print("Stream Log")
    # for line in container.logs(stream=True):
    #     print (line.strip())
