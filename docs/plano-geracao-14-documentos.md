# Plano pragmático para geração dos 14 documentos

## Objetivo

Evoluir o produto de um formulário único para uma plataforma de geração documental, com 14 tipos de documentos disponíveis desde já. Os documentos mais maduros entram como versão principal; os demais ficam marcados como beta enquanto ganham refinamento por uso, revisão e exemplos reais.

## Estratégia

1. Criar um catalogo único dos documentos.
2. Dar a cada documento seu proprio conjunto de campos, seções, checklist e prompt.
3. Exibir todos na área interna, separados por catégoria.
4. Marcar como beta os documentos que ainda precisam de revisão fina.
5. Usar a mesma base para landing pages, sidebar, API e geração por IA.

## Documentos da primeira cobertura

### Executivo: compras e licitações

- ETP - Estudo Técnico Preliminar.
- Termo de Referência.
- Edital de Licitação.
- Mapa de Riscos.
- Processo de Dispensa e Inexigibilidade.
- Pesquisa de Preços.
- Parecer Jurídico de Compras.
- Minuta de Contrato.

### Executivo: atos administrativos

- Decreto Executivo e Portaria.

### Legislativo

- Projeto de Lei.
- Requerimento e Indicação Legislativa.
- Parecer de Comissão.
- Emenda Parlamentar.
- Justificativa de Projeto de Lei.

## Nivel de maturidade

- Estavel: documentos mais próximos de uso demonstravel, com estrutura mais clara.
- Beta: documentos disponíveis para demonstração e teste, mas ainda sujeitos a refinamento de prompt, campos e checklist.

## Etapa 1 - Base documental

Criar uma fonte unica em codigo para os 14 documentos, contendo:

- slug publico;
- nome;
- catégoria;
- status de maturidade;
- descricao;
- campos do formulário;
- seções esperadas;
- orientacao específica para a IA;
- pontos de aténcao do prompt.

Resultado esperado: a área interna passa a listar todos os documentos, e a API passa a aceitar todos os tipos.

## Etapa 2 - Prompts individuais

Separar a logica de prompt por documento. Cada tipo documental deve orientar a IA de forma própria, por exemplo:

- ETP: necessidade, alternativas, viabilidade, parcelamento e riscos.
- TR: específicações, execução, recebimento, fiscalização e obrigações.
- Edital: regras do certame, habilitação, julgamento, recursos e anexos.
- Parecer jurídico: relatorio, ressalvas, pendências e conclusão cautelosa.
- Projeto de Lei: ementa, artigos, vigência e justificativa.

Resultado esperado: as minutas deixam de ter cara generica e passam a respeitar melhor a natureza de cada documento.

Status: base implementada. Os 14 documentos agora possuem perfil proprio de prompt, com persona, objetivo, regras obrigatorias, proibicoes, notas de estrutura, padrao de qualidade e critérios de revisão.

## Etapa 3 - Checklist por documento

Cada documento deve ter uma revisão própria, com alertas sobre:

- seções ausentes;
- dados obrigatorios não informados;
- riscos de texto genérico;
- pontos jurídicos que exigem revisão humana;
- pendências técnicas, orçamentárias e administrativas.

Resultado esperado: a ferramenta não apenas gera texto, mas ajuda o servidor a saber o que ainda precisa revisar.

Status: base implementada. Os 14 documentos agora possuem checklist automatico por regras, usado no fallback local e anexado ao relatorio de revisão quando a IA responde.

## Etapa 4 - Landing pages específicas

Padronizar as rotas do protótipo e conectar cada landing ao documento correto no gerador.

Rotas prioritarias:

- `/gerador-etp`
- `/gerador-termo-de-referencia`
- `/gerador-edital-licitacao`
- `/gerador-mapa-de-riscos`
- `/gerador-processo-dispensa`
- `/gerador-pesquisa-de-preços`
- `/gerador-parecer-jurídico`
- `/gerador-decreto-executivo`
- `/gerador-minuta-de-contrato`
- `/gerador-projeto-de-lei`
- `/gerador-requerimento-legislativo`
- `/gerador-parecer-comissao`
- `/gerador-emenda-parlamentar`
- `/gerador-justificativa-projeto-de-lei`

Resultado esperado: SEO, navegacao e área interna passam a falar a mesma lingua.

Status: base implementada. As landing pages dos 14 documentos usam dados do catalogo documental, mostram estrutura, campos obrigatorios, orientacoes específicas, FAQ, relacionados e CTA para abrir `/gerador` com o documento correto selecionado.

## Etapa 5 - Refinamento por prioridade comercial

Depois que os 14 estiverem disponíveis, aprofundar primeiro os mais fortes para Prefeituras:

1. ETP.
2. Termo de Referência.
3. Dispensa e Inexigibilidade.
4. Pesquisa de Preços.
5. Mapa de Riscos.
6. Edital.
7. Contrato.
8. Parecer Jurídico.

Depois disso, aprofundar Legislativo e atos administrativos.

## Critério de pronto para demonstração

O produto estára pronto para demonstração quando:

- os 14 documentos aparecerem na área interna;
- cada documento tiver campos proprios;
- a IA receber orientacoes específicas;
- documentos beta estiverem claramente marcados;
- a minuta gerada vier estruturada em seções;
- as pendências forem sinalizadas sem esconder limitacoes.
