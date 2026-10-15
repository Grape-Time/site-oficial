# Configuração e próximos pontos de conexão

Edite `assets/js/config.js`. Todos os campos são públicos. O arquivo deve conter apenas URLs públicas, e-mail comercial e informações comerciais.

| Campo | Resultado ao preencher |
| --- | --- |
| `loginUrl` | Exibe “Entrar” apontando para o login oficial |
| `schedulingUrl` | Direciona os botões superiores “Agendar demonstração” para a agenda oficial |
| `contactEmail` | Permite abrir o resumo no aplicativo de e-mail do visitante |
| `demoEndpoint` | Habilita envio de solicitações via POST e troca o botão para “Solicitar demonstração” |
| `privacyUrl` | Exibe o link de privacidade no rodapé |
| `termsUrl` | Exibe o link de termos no rodapé |

Use HTTPS em produção. Um caminho relativo de mesma origem também funciona quando servido por HTTP/HTTPS. Arquivos abertos por `file://` não têm uma origem de servidor para um endpoint relativo.

## Formulário

Sem endpoint, todos os dados ficam somente na memória da página. Nada é enviado ou salvo automaticamente. O visitante pode copiar o texto ou baixar um resumo voluntariamente. Ao recarregar a página, o site não recupera dados de armazenamento local.

Com endpoint, a página envia JSON como este:

```json
{
  "name": "Pessoa Exemplo",
  "company": "Agência Exemplo",
  "email": "pessoa@example.com",
  "profile": "Agência de marketing de influência",
  "interest": "professional",
  "period": "monthly",
  "payment": "standard"
}
```

O destino deve retornar HTTP 2xx e JSON:

```json
{ "success": true }
```

Uma resposta HTML, HTTP 4xx/5xx, JSON sem `success: true` ou ausência de resposta não confirma recebimento. O formulário preserva os dados nesse caso. Não há repetição automática. Uma resposta tardia pode ter sido processada no servidor; planeje deduplicação no backend antes de publicar.

O frontend aguarda até 15 segundos. O endpoint precisa validar os campos novamente, limitar abusos, aplicar regras de retenção e armazenar/encaminhar a solicitação. Se estiver em outro domínio, precisa permitir CORS para a origem do site. Nenhum desses serviços é provisionado por este pacote.

O servidor local `scripts/serve.mjs` não implementa esse endpoint. A integração com o backend deve acontecer separadamente. Não exponha chaves do produto, credenciais de serviços ou acesso administrativo no navegador.

## Anual e Pix

O seletor “Pix” usa os preços mensais definidos. Os campos anuais começam como `null` e apresentam “Sob consulta”. Preencha somente após validar os valores. O total anual dividido por 12 é apresentado como equivalente mensal; o total contratado fica visível logo abaixo.

## Antes de publicação

- Substituir o wordmark provisório pelo SVG oficial, se necessário.
- Confirmar preços, limites, recursos e condições de usuários do Enterprise.
- Conectar a agenda e/ou o canal comercial efetivo.
- Fornecer os destinos oficiais de login e documentos legais aplicáveis.
- Validar o layout e as interações no navegador do computador e no celular.
- Incluir domínio definitivo, URL canônica, imagem de compartilhamento e sitemap após definir a hospedagem.

O projeto não possui analytics, cookies próprios, pixels de publicidade ou checkout. Não há conexão com os dados reais da Grape.
