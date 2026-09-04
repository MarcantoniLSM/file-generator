# Proximos passos para atingir o escopo comercial e funcional

## Objetivo

Transformar o protótipo atual em uma plataforma de geração de documentos públicos para Prefeituras e Câmaras, com páginas de captação, biblioteca de modelos, ferramentas gratuitas e um gerador progressivamente mais especializado.

## Estado atual

- Landing page institucional criada.
- Tela geradora movida para `/gerador`.
- Páginas comerciais iniciais criadas para Executivo e Legislativo.
- Hub inicial de modelos em `/modelos`.
- Rotas de ferramentas gratuitas criadas como páginas de apresentação.
- Paleta e tipografia aproximadas do manual de marca.
- Gerador com configuracao basica de Prefeitura e chamadas para OpenAI.

## Fase 1 - Produto navegavel e coerente

1. Refinar identidade visual
   - Criar componente de marca/logotipo em SVG ou imagem.
   - Padronizar cabeçalhos, botoes, cards e seções.
   - Melhorar responsividade mobile da landing e do gerador.
   - Criar estádos de erro, carregamento e sucesso mais institucionais.

2. Melhorar landing pages
   - Criar copy específica para cada página, não apenas templaté genérico.
   - Adicionar exemplos de saida para cada documento.
   - Incluir perguntas frequentes por tipo documental.
   - Inserir CTA contextual para abrir o gerador com tipo documental pre-selecionado.

3. Melhorar gerador atual
   - Persistir configuracao da Prefeitura no navegador.
   - Permitir selecionar documento por catégoria: Executivo, Legislativo, Comunicacoes.
   - Adicionar campos condicionais por documento.
   - Exibir checklist de pendências ao lado da minuta.
   - Exportar em DOCX, não apenas TXT.

## Fase 2 - Cobertura documental real

1. Compras e licitações
   - DFD completo.
   - ETP completo.
   - Termo de Referência.
   - Mapa de Riscos.
   - Relatório de Pesquisa de Preços.
   - Minuta de Edital limitada por modalidade.
   - Minuta de Contrato.
   - Processo de Dispensa e Inexigibilidade.

2. Legislativo e atos normativos
   - Projeto de Lei.
   - Justificativa de Projeto de Lei.
   - Parecer de Comissão.
   - Emenda modificativa/aditiva.
   - Requerimento e Indicação.
   - Decreto municipal e Portaria.

3. Modelos prontos
   - Criar conteúdo real para cada modelo.
   - Permitir abrir modelo no gerador.
   - Permitir baixar modelo em DOCX.
   - Capturar lead antes de download, se fizer sentido comercial.

## Fase 3 - Configuracao institucional

1. Perfil da Prefeitura
   - Nome oficial.
   - CNPJ.
   - Município/UF.
   - Secretarias.
   - Responsaveis.
   - Cabecalho e rodape.
   - Assinaturas padrao.

2. Templatés por órgão
   - Salvar seções obrigatorias por tipo documental.
   - Definir textos padrao.
   - Definir campos obrigatorios.
   - Definir nomenclatura local.

3. Base normativa
   - Upload de normas locais.
   - Classificacao por tipo.
   - Status vigente/revogado.
   - Busca textual inicialmente.
   - RAG com pgvector em fase posterior.

## Fase 4 - IA mais confiavel

1. Prompts especializados
   - Criar prompt separado por tipo documental.
   - Usar exemplos de documentos reais.
   - Definir estrutura obrigatoria por documento.
   - Pedir pendências explicitas quando faltarem dados.

2. Validacao
   - Checklist deterministico por documento.
   - Deteccao de campos ausentes.
   - Alertas sobre valores, prazos, justificativas e quantidade.
   - Relatório de revisão antes da exportacao.

3. Rastreabilidade
   - Registrar modelo usado.
   - Registrar prompt, tipo documental e fontes.
   - Registrar versão do templaté.
   - Mostrar fontes usadas quando houver base normativa.

## Fase 5 - Ferramentas gratuitas

1. Calculadora de limites de dispensa
   - Validar regra legal vigente antes de públicar cálculos.
   - Incluir aviso de revisão obrigatoria.
   - Registrar data de atualizacao da base.

2. Calculadora de prazos da Lei 14.133
   - Permitir selecionar evento inicial.
   - Calcular prazos com explicacao.
   - Indicar feriados apenas em fase posterior.

3. Validador de redação legislativa
   - Checar ementa, artigos, parágrafos, incisos e cláusula de vigência.
   - Apontar problemas de técnica legislativa.
   - Sugerir reescrita.

## Fase 6 - Comercial e SEO

1. SEO programatico
   - Metadata única por página.
   - Titulos e descricoes por intencao de busca.
   - Conteudo textual robusto por landing page.
   - Links internos entre documentos relacionados.

2. Captura e conversão
   - Formulários de interesse.
   - CTA para demonstração.
   - Download de modelos com lead.
   - Eventos de analytics.

3. Pilotos
   - Selecionar uma Prefeitura e uma Camara.
   - Coletar modelos reais.
   - Comparar saidas geradas com documentos usados hoje.
   - Ajustar prompts e campos a partir do uso real.

## Marco de MVP ampliado

O MVP ampliado deve ser considerado pronto quando:

- A landing comunica claramente promessa, limites e documentos gerados.
- O gerador produz DFD, ETP e TR com qualidade superior ao templaté simples.
- A Prefeitura consegue configurar cabeçalho institucional.
- O usuário consegue revisar e exportar uma minuta.
- Existem páginas comerciais navegaveis para os principais documentos.
- Existe ao menos uma biblioteca inicial de modelos.
- As ferramentas gratuitas possuem página própria, ainda que nem todas estejám funcionais.
