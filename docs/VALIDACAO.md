# Validação desta entrega

Verificação feita no ambiente de criação:

- Sintaxe JavaScript dos arquivos de configuração, interações e scripts Node.
- Integridade das referências locais de CSS, JavaScript e imagens.
- Destinos de âncoras, IDs únicos, idioma da página e rótulos dos campos.
- Geração da pasta de distribuição com os mesmos arquivos públicos da origem.
- Regras estáticas de preços mensais, Pix e ausência de valores anuais inventados.

Há estilos responsivos para celular, tablet e desktop, menu com estado acessível, foco visível, link de salto para o conteúdo e respeito à preferência de movimento reduzido.

Não foi feita validação visual ou de interações em um navegador neste ambiente, pois a ferramenta de navegador necessária ao fluxo de prévia não estava disponível. O script PowerShell não foi executado em Windows. Não houve envio de formulário a serviço externo, instalação no disco C: nem publicação do site.

## Roteiro curto de revisão local

1. Abra `index.html`; confira a página em 1440 px, 768 px e 390 px.
2. Em largura de celular, abra o menu, selecione uma seção e confira se ele fecha; verifique Tab e Escape.
3. Alterne entre Padrão/Pix e Mensal/Anual. Anual deve mostrar “Sob consulta”.
4. Clique em um plano: o campo de interesse no formulário deve receber a mesma escolha.
5. Abra e feche as dúvidas com clique e teclado.
6. Preencha o formulário. O resumo deve dizer que ainda não foi enviado; teste copiar e baixar.
7. Confira se nenhum conteúdo ultrapassa a tela e se a interface continua utilizável com zoom de 200%.

Depois de configurar um endpoint real, valide sucesso, falha HTTP, conexão indisponível e ausência de confirmação antes de liberar o formulário público.
