# Projeto_painel
**Descrição do repositório:**  Dashboard interativo que compara o uso e a cobertura da terra em Teresópolis (RJ) entre 1985 e 2025, com dados do MapBiomas Coleção 11. Inclui visualizações por classe, principais transições e mapas temáticos.

## Dashboard interativo

Abra `dashboard_mapbiomas/index.html` no navegador ou execute, na raiz do projeto:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dashboard_mapbiomas
```

Acesse http://127.0.0.1:8080.

- Comparação da composição territorial em 1985 e 2025.
- Seleção de classe sincronizada entre os painéis dos anos, o destaque e as transições.
- Consulta de áreas, participação e variação ao passar o mouse ou focar os gráficos com o teclado.
- Busca, ordenação e alternância entre hectares e porcentagem territorial.
- Matriz completa de transições, com seleção persistente por clique ou toque.
- Layout responsivo, paleta ambiental e ilustração vetorial estilizada do Dedo de Deus.

Os mapas originais são imagens estáticas. Os dados disponíveis cobrem apenas 1985 e 2025. As cores dos gráficos foram adaptadas para a interface; a imagem dos mapas conserva sua legenda original. A fonte Manrope usa Google Fonts, com alternativa local do sistema se estiver offline. Não há dependências de instalação para visualizar o dashboard.
