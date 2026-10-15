/** Configuração pública. Não coloque senhas, tokens ou chaves privadas aqui. */
window.GRAPE_CONFIG = {
  brand: 'Grape',

  // Preencher somente com os endereços oficiais verificados.
  loginUrl: '',
  schedulingUrl: '',
  contactEmail: 'comercial@grapetecnologia.com',
  demoEndpoint: 'https://formsubmit.co/ajax/comercial@grapetecnologia.com',
  privacyUrl: '',
  termsUrl: '',
  
  // Valores mensais da prévia. Anuais precisam ser aprovados antes da publicação.
  // monthly: valor por mês. annual: valor TOTAL do contrato anual (não a parcela).
  prices: {
    essential: {
      monthly: { standard: 679, pix: 615 },
      annual: { standard: null, pix: null }
    },
    professional: {
      monthly: { standard: 1259, pix: 1139 },
      annual: { standard: null, pix: null }
    },
    enterprise: {
      monthly: { standard: 5870, pix: 5290 },
      annual: { standard: null, pix: null }
    }
  }
};
