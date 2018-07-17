
# Download BSP from JPL

Descrição de como baixar os arquivo BSP que serão usados como input pelo programa NIMA. 

### Dependência
Instalar a tool Expect. [documentation here](https://core.tcl.tk/expect/index)

Testado no Ubuntu usando apt-get
```
sudo apt-get install expect telnet ftp
```

É necessário a versão Expect 5.45
```
$ expect -v
expect version 5.45
```

### Instalar o Script Small Body SPK
Baixar o Script disponibilizado pelo JPL [deste link] (ftp://ssd.jpl.nasa.gov/pub/ssd/SCRIPTS/smb_spk) e dar permissão de execução.

```
wget ftp://ssd.jpl.nasa.gov/pub/ssd/SCRIPTS/smb_spk -O smb_spk
```

```
chmod +x smb_spk
```

### Executando o script

Para baixar os arquivos BSP é necessário passar os seguintes parametros

Nome do Objeto, Periodo, um email válido e o nome do arquivo. 

exemplo:
```
./smb_spk -b "1999 RB216;" 2000-Jan-01 2030-Jan-01 <seu_email>@gmail.com.br 1999RB216.bsp
```
Mais descrições de como usar o script estão no cabeçalho do script.

Parametros utilizados no exemplo:

    -b  : create file in default binary format. RECOMMENDED. SPICE Toolkit versions N0052 and later have platform independent reader subroutines which can read files regardless of the "little-endian" or "big-endian" byte-order of the platform they were created on. 

    [small-body] : Horizons command to select single asteroid or comet (no planets or satellites .. SPK files for those object are precomputed and distributed separately). ENCLOSE STRING IN QUOTES. REQUIRED.

    [start] : Date the SPK file is to begin, within span [1900-2100]. REQUIRED. 
        Examples:  2003-Feb-1 
                   "2003-Feb-1 16:00"

    [stop] : Date the SPK file is to end, within span [1900-2100]. REQUIRED. Must be more than 32 days later than [start].
    Examples:  2006-Jan-12
               "2006-Jan-12 12:00"

    [e-mail] : User's Internet e-mail contact address. REQUIRED.
    Example: joe@your.domain.name
    This might be used for critical/urgent follow-up situations, but otherwise not.

    {file_name} : OPTIONAL name to give the file on your system. If not specified, it uses the SPK ID to assign a local file name in the current directory. Default form:
    #######.bsp  (binary SPK -b argument)
    where "#######" is the SPICE ID integer. 


### Alteração do Código
Ao utilizar o script smb_spk a partir do contariner, foi necessário alterar parte do código, estava tendo erro de conexão do lado do container, até abria a conexão autenticava mais dava erro na ultima etapa na linha do comando get.

Para resolver tive que alterar essa parte do código e adicionar o comanto ftp "passive" isso resolveu o problema de conexão. adicionei também o comando para fechar o ftp "quit". 

O código funcional ficou assim

Antes:
```
  set timeout -1
  expect "ftp> " { send "get $ftp_name $local_file\r" }

```

Depois:
```
  set timeout -1
  expect "ftp> " { send passive\r }
  expect "ftp> " { send "get $ftp_name $local_file\r" }
  expect "ftp> " { send "quit\r" }
```