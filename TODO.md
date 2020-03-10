# Astrometry Pipeline
- [ ] feature - Reaproveitar catalogo de referencia, guardar as querys feitas no GAIA DR2. 
- [ ] feature - Reaproveitar Astrometria do ccd, executar 1 vez por ccd e guardar o resultado independente do objeto.
- [ ] fix - Problema no Condor ao usar RequireWholeMachine, todos os jobs vão para mesma maquina. não considera as maquinas da lista 'SlotsTno' ( Time de Infra, vou criar o ticket )
- [ ] fix - Problema no Condor, os container estão limitados a 2GB de RAM. ( Time de Infra, vou criar o ticket )
- [x] fix - Download do BSP JPL, com data hardcoded
- [ ] fix - Astrometria não encontra posições para a maioria dos ccds. O código está executando os CCDs fora de ordem, por isso o match não acontece. 

# Filter Object
- [ ] fix - Problema na query que apresenta o total de objetos, query executa a cada troca de filtro gerando lentidão. 
- [ ] feature - Alterar a visualização da Lista de Objetos, Martin solicitou que a lista apresente os objetos agrupados, hoje é apresentado cada observação do objeto. e que tenha estatisticas de cada objeto individual como qtd CCD, filtros diferentes, se tem todos os CCDs, etc. 

# Refine Orbit 
- [ ] fix - Erro ao executar, erro com aquivo *_a.obs.  
- [x] fix - Arquivo de configuração do Nima com input hardcoded.   
- [ ] feature - Executar o Refine Orbit no condor. 

# Predict Occultation
- [ ] fix - Erro Positions file was not created, a predição não está executando para nenhum objeto.

# General
- [ ] feature - Organizar os Status de execução, para que possam ser ordenados.
- [ ] feature - Pagina publica de acesso as predições. 
- [ ] feature - Guardar informações do BSP JPL, criar função para ler os headers do BSP como Periodo e Versão e SPK ID. 
