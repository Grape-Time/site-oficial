# Grape — site oficial

Estrutura inicial do site institucional da Grape baseada na prévia desktop enviada. HTML, CSS e JavaScript separados, sem dependências externas. Funciona por abertura direta de `index.html` e não exige `npm install`.

## Colocar na pasta solicitada

Extraia **o conteúdo do ZIP** diretamente em:

```text
C:\Users\Perinha\Desktop\Grape\Tecnologia\grape-site-oficial
```

O arquivo `index.html` deve ficar diretamente nessa pasta, junto de `assets`, `scripts` e `docs`. Abra `index.html` no navegador para visualizar. Abra a pasta inteira no VS Code para editar.

Se você extraiu o pacote em outro lugar, o script opcional `Instalar-na-pasta-Grape.ps1` copia o projeto para esse mesmo endereço. Execute-o no PowerShell a partir da pasta extraída:

```powershell
.\Instalar-na-pasta-Grape.ps1
```

O script recusa destinos com arquivos para evitar sobrescrever um trabalho existente. Se o Windows bloquear scripts, use a extração manual; não é necessário alterar políticas de execução.

Este pacote foi criado em um ambiente Linux, sem acesso direto ao disco `C:`. A instalação no computador Windows precisa ser feita por extração ou pelo script acima.

## Arquivos e responsabilidades

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Conteúdo e seções da página |
| `assets/css/styles.css` | Identidade visual, espaçamentos, desktop e celular |
| `assets/js/config.js` | Preços, contato, agendamento e destinos oficiais |
| `assets/js/main.js` | Menu, seletores de planos, formulário e resumo |
| `assets/img/grape-logo.png` | Wordmark vetorial provisório reconstituído da prévia |
| `assets/img/favicon.png` | Ícone da página |
| `scripts/serve.mjs` | Servidor local opcional, usando apenas Node.js |
| `scripts/build.mjs` | Cópia dos arquivos públicos para `dist` |
| `docs/INTEGRACOES.md` | Campos pendentes e contrato do formulário |
| `docs/VALIDACAO.md` | Verificações e limites desta entrega |

## Abrir com servidor local (opcional)

Com Node.js 18 ou superior instalado:

```powershell
cd "C:\Users\Perinha\Desktop\Grape\Tecnologia\grape-site-oficial"
npm run dev
```

Abra `http://localhost:3000`. O servidor aceita conexões apenas do próprio computador. Encerre com `Ctrl+C`. Ele serve arquivos estáticos e **não recebe solicitações comerciais**.

Outros comandos disponíveis:

```powershell
npm run check
npm run build
```

O build cria `dist` com `index.html` e `assets`, substituindo apenas uma versão anterior dessa pasta. Não publica nada e não requer instalação de pacotes.

## Seções incluídas

1. Cabeçalho e navegação.
2. Apresentação da Grape com um recorte ilustrativo do fluxo.
3. Público-alvo: curadores independentes, agências e operações de marcas.
4. Benefícios de curadoria, campanhas e gestão.
5. Como funciona, com confirmação humana dos vínculos.
6. Faixa de apoio da IA.
7. Planos e seleção de período/pagamento.
8. Dúvidas frequentes.
9. Solicitação de demonstração e rodapé.

## Identidade e conteúdo

- Roxo principal `#9052dd`, roxo profundo `#261046`, verde `#027a1e`, amarelo `#fff1a0`, branco e preto.
- Destaque roxo: “Ganhe tempo e mais produtividade”.
- “Como funciona” preservado; linguagem voltada a agendamento de uma conversa de apresentação.
- Sem oferta de teste grátis e sem ícones de Instagram, TikTok ou YouTube.
- A amostra do produto é uma composição em HTML com dados fictícios. A planilha real e a imagem de referência completa não estão incluídas no site público.
- Tipografia de sistema, sem carregamento de fontes ou imagens de terceiros.
- O logo é uma reconstrução provisória em SVG. Substitua `assets/img/grape-logo.png` pelo arquivo oficial antes de publicar, se disponível.

## Planos da referência

| Plano | Mensal padrão | Mensal Pix | Perfis/mês | Equipe | Campanhas |
| --- | ---: | ---: | ---: | --- | --- |
| Essential | R$ 679 | R$ 615 | 500 | 1 usuário | 10 |
| Professional | R$ 1.259 | R$ 1.139 | 1.000 | Até 4 usuários | Ilimitadas |
| Enterprise | R$ 5.870 | R$ 5.290 | 5.000 | Conforme contratação | Recursos do Professional |

Os valores padrão e volumes seguem a imagem fornecida. Os valores Pix foram recuperados do histórico da prévia. Não foram localizados os valores anuais aprovados; portanto, aparecem como “Sob consulta”. A expressão “usuários ilimitados” do Enterprise não foi reproduzida como promessa: o próprio rodapé da referência indicava a necessidade de confirmar essa condição.

Antes de publicar, confira toda a tabela comercial. Em `config.js`, preços mensais representam o valor por mês; preços anuais devem representar o **total do contrato anual**. O site calcula o equivalente mensal e mostra o total anual, sem inventar descontos.

## Estado das integrações

O site é uma estrutura de apresentação local. Não está publicado e não contém autenticação, cobrança, integração com o produto, banco de leads ou agendamento real.

O formulário valida os campos, prepara um resumo e permite copiar/baixar a solicitação. Ele informa claramente que nada foi enviado. Se um e-mail comercial for configurado, oferece abertura do aplicativo de e-mail. Se um endpoint for configurado, pode enviar uma solicitação real e exige resposta `{"success":true}` para confirmar o recebimento.

Os links “Entrar”, “Privacidade” e “Termos de uso” ficam ocultos até receberem destinos válidos. Não foram criados textos jurídicos nem inventados endereços. Os detalhes estão em `docs/INTEGRACOES.md`.

Não adicione chaves privadas ao JavaScript: todo o conteúdo do site estático fica acessível a visitantes.
