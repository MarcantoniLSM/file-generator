# Plano pragmatico para geracao dos 14 documentos

## Objetivo

Evoluir o produto de um formulario unico para uma plataforma de geracao documental, com 14 tipos de documentos disponiveis desde ja. Os documentos mais maduros entram como versao principal; os demais ficam marcados como beta enquanto ganham refinamento por uso, revisao e exemplos reais.

## Estrategia

1. Criar um catalogo unico dos documentos.
2. Dar a cada documento seu proprio conjunto de campos, secoes, checklist e prompt.
3. Exibir todos na area interna, separados por categoria.
4. Marcar como beta os documentos que ainda precisam de revisao fina.
5. Usar a mesma base para landing pages, sidebar, API e geracao por IA.

## Documentos da primeira cobertura

### Executivo: compras e licitacoes

- ETP - Estudo Tecnico Preliminar.
- Termo de Referencia.
- Edital de Licitacao.
- Mapa de Riscos.
- Processo de Dispensa e Inexigibilidade.
- Pesquisa de Precos.
- Parecer Juridico de Compras.
- Minuta de Contrato.

### Executivo: atos administrativos

- Decreto Executivo e Portaria.

### Legislativo

- Projeto de Lei.
- Requerimento e Indicacao Legislativa.
- Parecer de Comissao.
- Emenda Parlamentar.
- Justificativa de Projeto de Lei.

## Nivel de maturidade

- Estavel: documentos mais proximos de uso demonstravel, com estrutura mais clara.
- Beta: documentos disponiveis para demonstracao e teste, mas ainda sujeitos a refinamento de prompt, campos e checklist.

## Etapa 1 - Base documental

Criar uma fonte unica em codigo para os 14 documentos, contendo:

- slug publico;
- nome;
- categoria;
- status de maturidade;
- descricao;
- campos do formulario;
- secoes esperadas;
- orientacao especifica para a IA;
- pontos de atencao do prompt.

Resultado esperado: a area interna passa a listar todos os documentos, e a API passa a aceitar todos os tipos.

## Etapa 2 - Prompts individuais

Separar a logica de prompt por documento. Cada tipo documental deve orientar a IA de forma propria, por exemplo:

- ETP: necessidade, alternativas, viabilidade, parcelamento e riscos.
- TR: especificacoes, execucao, recebimento, fiscalizacao e obrigacoes.
- Edital: regras do certame, habilitacao, julgamento, recursos e anexos.
- Parecer juridico: relatorio, ressalvas, pendencias e conclusao cautelosa.
- Projeto de Lei: ementa, artigos, vigencia e justificativa.

Resultado esperado: as minutas deixam de ter cara generica e passam a respeitar melhor a natureza de cada documento.

Status: base implementada. Os 14 documentos agora possuem perfil proprio de prompt, com persona, objetivo, regras obrigatorias, proibicoes, notas de estrutura, padrao de qualidade e criterios de revisao.

## Etapa 3 - Checklist por documento

Cada documento deve ter uma revisao propria, com alertas sobre:

- secoes ausentes;
- dados obrigatorios nao informados;
- riscos de texto generico;
- pontos juridicos que exigem revisao humana;
- pendencias tecnicas, orcamentarias e administrativas.

Resultado esperado: a ferramenta nao apenas gera texto, mas ajuda o servidor a saber o que ainda precisa revisar.

Status: base implementada. Os 14 documentos agora possuem checklist automatico por regras, usado no fallback local e anexado ao relatorio de revisao quando a IA responde.

## Etapa 4 - Landing pages especificas

Padronizar as rotas do prototipo e conectar cada landing ao documento correto no gerador.

Rotas prioritarias:

- `/gerador-etp`
- `/gerador-termo-de-referencia`
- `/gerador-edital-licitacao`
- `/gerador-mapa-de-riscos`
- `/gerador-processo-dispensa`
- `/gerador-pesquisa-de-precos`
- `/gerador-parecer-juridico`
- `/gerador-decreto-executivo`
- `/gerador-minuta-de-contrato`
- `/gerador-projeto-de-lei`
- `/gerador-requerimento-legislativo`
- `/gerador-parecer-comissao`
- `/gerador-emenda-parlamentar`
- `/gerador-justificativa-projeto-de-lei`

Resultado esperado: SEO, navegacao e area interna passam a falar a mesma lingua.

## Etapa 5 - Refinamento por prioridade comercial

Depois que os 14 estiverem disponiveis, aprofundar primeiro os mais fortes para Prefeituras:

1. ETP.
2. Termo de Referencia.
3. Dispensa e Inexigibilidade.
4. Pesquisa de Precos.
5. Mapa de Riscos.
6. Edital.
7. Contrato.
8. Parecer Juridico.

Depois disso, aprofundar Legislativo e atos administrativos.

## Criterio de pronto para demonstracao

O produto estara pronto para demonstracao quando:

- os 14 documentos aparecerem na area interna;
- cada documento tiver campos proprios;
- a IA receber orientacoes especificas;
- documentos beta estiverem claramente marcados;
- a minuta gerada vier estruturada em secoes;
- as pendencias forem sinalizadas sem esconder limitacoes.
