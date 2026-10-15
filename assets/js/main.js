/* Interações progressivas: navegação, preços e solicitação de demonstração. */
(() => {
  'use strict';

  // #Configuração pública e atalhos de seleção de elementos
  const config = window.GRAPE_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // #Estado global dos filtros de preço
  const state = { period: 'monthly', payment: 'standard' };
  const planNames = {
    essential: 'Essential',
    professional: 'Professional',
    enterprise: 'Enterprise',
    undecided: 'Preciso de orientação', custom: 'Custom' };
  const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  document.documentElement.classList.add('js');

  // #Utilitário: aceita apenas URLs públicas HTTPS ou de mesma origem
  function safeUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const parsed = new URL(value.trim(), location.href);
      const isLocalHttp = parsed.protocol === 'http:' && parsed.origin === location.origin;
      if (parsed.protocol !== 'https:' && !isLocalHttp) return null;
      if (parsed.username || parsed.password) return null;
      return parsed.href;
    } catch {
      return null;
    }
  }

  // #Menu mobile: controle de abertura/fechamento
  const navigation = $('#navegacao');
  const menuToggle = $('.menu-toggle');

  function closeMenu() {
    navigation.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('is-open', open);
  });

  $$('a', navigation).forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });

  const desktopMedia = matchMedia('(min-width: 1025px)');
  desktopMedia.addEventListener('change', closeMenu);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });

  // #Links dinâmicos (login, privacidade, termos, agendamento)
  [['[data-login]', config.loginUrl], ['[data-privacy]', config.privacyUrl], ['[data-terms]', config.termsUrl]].forEach(([selector, value]) => {
    const url = safeUrl(value);
    if (!url) return;
    $$(selector).forEach((link) => { link.href = url; link.hidden = false; });
  });

  const schedulingUrl = safeUrl(config.schedulingUrl);
  if (schedulingUrl) $$('[data-demo-link]').forEach((link) => { link.href = schedulingUrl; });

  // #Preços: atualiza valores conforme período/pagamento
  function updatePrices() {
    // GRAPE CUSTOM PLANS V2: preço padrão em destaque; Pix como informação complementar.
    const annual = state.period === 'annual';
    let allKnown = true;
    $$('[data-plan-card]').forEach(card => {
      const isCustom = card.dataset.planCard === 'custom';
      const prices = config.prices?.[card.dataset.planCard]?.[state.period] || {};
      const standard = prices.standard;
      const pix = prices.pix;
      const known = !isCustom && Number.isFinite(standard) && standard > 0;
      const pixKnown = !isCustom && Number.isFinite(pix) && pix > 0;
      $('.price', card).classList.toggle('quote', !known);
      $('.currency', card).hidden = !known;
      $('.price-unit', card).hidden = !known;
      $('[data-price]', card).textContent = known
        ? number.format(annual ? standard / 12 : standard)
        : 'Sob consulta';
      const detail = $('.price-detail', card);
      detail.replaceChildren();
      if (isCustom) {
        detail.textContent = 'Configuração conforme sua operação';
        return;
      }
      if (!known) {
        allKnown = false;
        detail.textContent = annual ? 'Condições anuais sob consulta' : 'Condições mensais sob consulta';
        return;
      }
      if (annual) {
        const total = document.createElement('span');
        total.textContent = money.format(standard) + ' no total anual';
        detail.append(total);
      }
      if (pixKnown && !annual) {
        const pixLine = document.createElement('span');
        pixLine.className = 'pix-price';
        const amount = document.createElement('strong');
        amount.textContent = money.format(pix);
        pixLine.append('ou ', amount, annual ? ' no Pix /ano' : '/mês no Pix');
        detail.append(pixLine);
      } else if (!annual) {
        detail.textContent = 'Condições de pagamento sob consulta';
      }
    });
    $$('[data-period]').forEach(button => {
      const selected = button.dataset.period === state.period;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    const pricingStatus = $('#pricing-status');
    if (pricingStatus) {
      pricingStatus.textContent = allKnown
        ? (annual ? 'Exibindo valores anuais, com equivalência mensal.' : 'Exibindo valores mensais e valores no Pix.') + ' Custom sob consulta.'
        : (annual ? 'Condições anuais sob consulta.' : 'Condições mensais sob consulta.') + ' Custom sob consulta.';
    }
  }

  $$('[data-period]').forEach((button) => button.addEventListener('click', () => { state.period = button.dataset.period; updatePrices(); }));
  $$('[data-payment]').forEach((button) => button.addEventListener('click', () => { state.payment = button.dataset.payment; updatePrices(); }));

  updatePrices();

  $$('[data-plan]').forEach((link) => link.addEventListener('click', () => { $('#interest').value = link.dataset.plan; }));

  $('#year').textContent = new Date().getFullYear();

  // #Formulário de demonstração e diálogo de solicitação
  const form = $('#demo-form');
  const submitButton = $('.form-submit');
  const status = $('#form-status');
  const dialog = $('#request-dialog');
  const summary = $('#request-summary');

  const endpoint = safeUrl(config.demoEndpoint);
  const email = typeof config.contactEmail === 'string' && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.contactEmail) ? config.contactEmail : '';

  submitButton.disabled = false;
  if (endpoint) {
    $('#submit-label').textContent = 'Solicitar demonstração';
    $('#form-help').textContent = 'Solicite uma conversa de apresentação. A data será confirmada pela equipe da Grape.';
  } else if (email) {
    $('#form-help').textContent = 'Revise o resumo e abra seu aplicativo de e-mail para enviar a solicitação à equipe.';
  }

  // #Monta o texto da solicitação
  function requestText(data) {
    return [
      'Olá, equipe Grape! Gostaria de agendar uma demonstração.', '',
      `Nome: ${data.name}`, `Empresa: ${data.company}`, `E-mail: ${data.email}`,
      `Operação: ${data.profile}`, `Plano de interesse: ${planNames[data.interest] || planNames.undecided}`,
      `Período: ${data.period === 'annual' ? 'Anual' : 'Mensal'}`,
      `Pagamento: ${data.payment === 'pix' ? 'Pix' : 'Padrão'}`, '',
      'Gostaria de conhecer a ferramenta e entender como ela pode apoiar minha rotina.'
    ].join('\n');
  }

  // #Prepara o modal de resumo
  function prepareRequest(data) {
    summary.value = requestText(data);
    $('#dialog-status').textContent = '';
    const emailLink = $('#email-request');
    emailLink.hidden = !email;
    if (email) emailLink.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent('Demonstração Grape')}&body=${encodeURIComponent(summary.value)}`;
    status.textContent = 'Solicitação preparada para revisão. Nenhum dado foi enviado.';
    status.classList.remove('success');
    dialog.showModal();
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitButton.disabled || !form.reportValidity()) return;
    const values = Object.fromEntries(new FormData(form));
    const data = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value.trim()]));
    if (!data.name || !data.company) {
      status.textContent = 'Preencha seu nome e sua empresa para continuar.';
      status.focus();
      return;
    }
    data.period = state.period;
    data.payment = state.payment;
    if (!endpoint) { prepareRequest(data); return; }

    submitButton.disabled = true;
    status.classList.remove('success');
    status.textContent = 'Enviando sua solicitação…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const payload = {
        Nome: data.name,
        Empresa: data.company,
        email: data.email,
        Operacao: data.profile,

        Plano: {
          essential: 'Essential',
          professional: 'Professional',
          enterprise: 'Enterprise',
          custom: 'Custom',
          undecided: 'Preciso de orientação'
        }[data.interest] || 'Preciso de orientação',

        Periodo: data.period === 'annual' ? 'Anual' : 'Mensal',

        _subject: 'Grape — Nova solicitação de demonstração',
        _template: 'table',
        _replyto: data.email,
        _honey: data._honey || '',
        _url: window.location.origin + window.location.pathname
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit',
        referrerPolicy: 'strict-origin-when-cross-origin'
      });

      const result = await response.json().catch(() => null);

      const mensagemServico =
        typeof result?.message === 'string'
          ? result.message
          : '';

      if (!response.ok) {
        throw new Error(
          `FormSubmit: HTTP ${response.status}. ${mensagemServico}`
        );
      }

      if (!result) {
        throw new Error(
          'O FormSubmit retornou uma resposta em formato inesperado.'
        );
      }

      if (result.success !== true && result.success !== 'true') {
        throw new Error(
          mensagemServico || 'O FormSubmit não confirmou o envio.'
        );
      }
      status.textContent = 'Solicitação recebida! A equipe entrará em contato para combinar a demonstração. Sua data ainda não está agendada.';
      status.classList.add('success');
      form.reset();
    } catch (error) {
      console.error('Erro no envio do formulário:', error);

      status.classList.remove('success');

      status.textContent =
        'Não conseguimos confirmar o envio agora. ' +
        'Seus dados continuam preenchidos. ' +
        'Tente novamente em instantes ou entre em contato pelo e-mail ' +
        'comercial@grapetecnologia.com.';
    } finally {
      clearTimeout(timeout);
      submitButton.disabled = false;
      status.focus();
    }
  });

  // #Ações do diálogo: fechar, copiar, abrir e-mail, baixar
  $('.dialog-close').addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });

  $('#copy-request').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('NO_CLIPBOARD');
      await navigator.clipboard.writeText(summary.value);
      $('#dialog-status').textContent = 'Texto copiado. A solicitação ainda precisa ser enviada.';
    } catch {
      summary.focus();
      summary.select();
      $('#dialog-status').textContent = 'Selecione e copie o texto com Ctrl+C (ou Cmd+C).';
    }
  });

  $('#email-request').addEventListener('click', () => {
    $('#dialog-status').textContent = 'Conclua o envio no seu aplicativo de e-mail. A abertura do aplicativo não confirma o envio.';
  });

  $('#download-request').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([summary.value], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'solicitacao-demonstracao-grape.txt';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('#dialog-status').textContent = 'Resumo preparado para download. A solicitação ainda não foi enviada.';
  });
})();

/* Ajustes extraídos de index.html */
(() => {
  function atualizarPlanos() {
    const section = document.querySelector('#planos');
    const config = window.GRAPE_CONFIG;

    if (!section || !config?.prices) return;
    if (section.dataset.pricingPolishReady === 'true') return;

    section.dataset.pricingPolishReady = 'true';

    /* Valores confirmados na referência */
    const valores = {
      essential: {
        monthly: { standard: 679, pix: 615 },
        annual: { standard: 6828, pix: 6490 }
      },
      professional: {
        monthly: { standard: 1259, pix: 1139 },
        annual: { standard: 12588, pix: 11950 }
      },
      enterprise: {
        monthly: { standard: 5870, pix: 5290 },
        annual: { standard: 56280, pix: 53500 }
      }
    };

    Object.entries(valores).forEach(([plano, precos]) => {
      config.prices[plano] = {
        ...config.prices[plano],
        monthly: { ...precos.monthly },
        annual: { ...precos.annual }
      };
    });

    /* Recursos do Enterprise */
    const enterprise = section.querySelector(
      '[data-plan-card="enterprise"] .plan-features ul'
    );

    if (enterprise) {
      enterprise.innerHTML = `
        <li>Até <strong>5.000 perfis/mês</strong></li>
        <li><strong>Usuários ilimitados</strong></li>
        <li><strong>Campanhas ilimitadas</strong></li>
        <li>Suporte prioritário</li>
        <li><strong>Dashboard de produtividade</strong></li>
      `;
    }

    /* Estrutura e recursos do Custom */
    const custom = section.querySelector('.custom-card');

    if (custom) {
      custom.removeAttribute('data-plan-card');
      custom.setAttribute('aria-labelledby', 'custom-plan-title');

      custom.innerHTML = `
        <h3 id="custom-plan-title">Custom</h3>

        <p class="plan-description">
          De acordo com sua necessidade
        </p>

        <div class="price">
          <strong class="custom-message">
            Personalize do seu jeito
          </strong>
        </div>

        <p class="price-detail">
          <span>Proposta sob consulta</span>
          <span class="custom-offer">
            <strong>5% de desconto</strong>
            para volumes acima de 6.000 perfis
          </span>
        </p>

        <a
          class="button button-outline"
          href="#demonstracao"
          data-plan="custom"
        >
          Contratar Custom
        </a>

        <div class="plan-features">
          <p>Configure os recursos do seu plano</p>
          <ul>
            <li>Defina a quantidade de <strong>perfis</strong></li>
            <li>Defina a quantidade de <strong>usuários</strong></li>
            <li><strong>Campanhas ilimitadas</strong></li>
            <li>Opção de <strong>dashboard</strong></li>
          </ul>
        </div>
      `;

      const interest = document.querySelector('#interest');

      if (interest && !interest.querySelector('option[value="custom"]')) {
        const option = document.createElement('option');
        option.value = 'custom';
        option.textContent = 'Custom — plano sob medida';
        interest.append(option);
      }

      custom.querySelector('[data-plan="custom"]')
        .addEventListener('click', () => {
          if (!interest) return;

          interest.value = 'custom';
          interest.dispatchEvent(
            new Event('change', { bubbles: true })
          );
        });
    }

    const moeda = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    const numero = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 2
    });

    function exibirPrecos() {
      const selecionado = section.querySelector(
        '[data-period][aria-pressed="true"]'
      );

      const periodo = selecionado?.dataset.period || 'monthly';
      const anual = periodo === 'annual';

      section.dataset.billing = periodo;

      section.querySelectorAll('[data-plan-card]').forEach(card => {
        const plano = card.dataset.planCard;
        const precos = config.prices[plano];

        if (!precos) return;

        const detalhe = card.querySelector('.price-detail');
        const destaque = card.querySelector('[data-price]');
        const unidade = card.querySelector('.price-unit');
        const currency = card.querySelector('.currency');
        const price = card.querySelector('.price');

        if (!detalhe || !destaque || !unidade || !currency || !price) {
          return;
        }

        const atual = precos[periodo];

        if (!atual || !Number.isFinite(atual.standard)) return;

        price.classList.remove('quote');
        currency.hidden = false;
        unidade.hidden = false;
        unidade.textContent = '/mês';

        destaque.textContent = numero.format(
          anual ? atual.standard / 12 : atual.standard
        );

        price.title = anual
          ? `Equivalente mensal do plano anual de ${moeda.format(atual.standard)}`
          : '';

        if (anual) {
          const economia =
            precos.monthly.standard * 12 - atual.standard;

          detalhe.innerHTML = `
            <span class="annual-total">
              ${moeda.format(atual.standard)}/ano
            </span>

            <span class="annual-saving">
              Economize ${moeda.format(economia)}/ano no padrão
            </span>
          `;
        } else {
          detalhe.innerHTML = `
            <span class="saving-label">
              Economize
            </span>

            <span class="pix-price">
              <strong>${moeda.format(atual.pix)}</strong>/mês no Pix
            </span>
          `;
        }
      });
    }

    /* Atualiza depois da lógica de preços existente */
    section.querySelectorAll('[data-period]').forEach(botao => {
      botao.addEventListener('click', exibirPrecos);
    });

    const botaoAtual = section.querySelector(
      '[data-period][aria-pressed="true"]'
    ) || section.querySelector('[data-period="monthly"]');

    if (botaoAtual) {
      botaoAtual.click();
    } else {
      exibirPrecos();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      atualizarPlanos,
      { once: true }
    );
  } else {
    atualizarPlanos();
  }
})();

(() => {
  function aplicarAjustes() {
    const enterprise = document.querySelector(
      '#planos [data-plan-card="enterprise"]'
    );

    if (!enterprise) return;

    const descricao = enterprise.querySelector('.plan-description');

    if (descricao) {
      descricao.textContent = 'Para grandes agências e marcas';
    }

    enterprise.querySelectorAll('.plan-features li').forEach(item => {
      if (item.textContent.trim() === 'Suporte prioritário') {
        const destaque = document.createElement('strong');
        destaque.textContent = 'Suporte prioritário';
        item.replaceChildren(destaque);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarAjustes, {
      once: true
    });
  } else {
    aplicarAjustes();
  }
})();

(() => {
  function ajustarTextosDoSite() {
    // Título das perguntas frequentes
    const tituloFaq = document.querySelector('#faq-title');

    if (tituloFaq) {
      tituloFaq.innerHTML = 'Antes de dar<br>o próximo passo';
    }

    // Título do formulário
    const tituloContato = document.querySelector('#contact-title');

    if (tituloContato) {
      tituloContato.innerHTML =
        'Mais tempo para<br>o que só você<br>sabe fazer';
    }

    // Texto do botão
    const textoBotao = document.querySelector('#submit-label');

    if (textoBotao) {
      textoBotao.textContent = 'Enviar Solicitação';
    }

    // Remover a seta do botão
    document.querySelectorAll(
      '#demo-form .form-submit [aria-hidden="true"]'
    ).forEach(seta => seta.remove());

    // Simplificar o nome do plano no formulário
    const opcaoCustom = document.querySelector(
      '#interest option[value="custom"]'
    );

    if (opcaoCustom) {
      opcaoCustom.textContent = 'Custom';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      ajustarTextosDoSite,
      { once: true }
    );
  } else {
    ajustarTextosDoSite();
  }
})();

/* Ajustes extraídos de index.html */
(() => {
  function atualizarPlanos() {
    const section = document.querySelector('#planos');
    const config = window.GRAPE_CONFIG;

    if (!section || !config?.prices) return;
    if (section.dataset.pricingPolishReady === 'true') return;

    section.dataset.pricingPolishReady = 'true';

    /* Valores confirmados na referência */
    const valores = {
      essential: {
        monthly: { standard: 679, pix: 615 },
        annual: { standard: 6828, pix: 6490 }
      },
      professional: {
        monthly: { standard: 1259, pix: 1139 },
        annual: { standard: 12588, pix: 11950 }
      },
      enterprise: {
        monthly: { standard: 5870, pix: 5290 },
        annual: { standard: 56280, pix: 53500 }
      }
    };

    Object.entries(valores).forEach(([plano, precos]) => {
      config.prices[plano] = {
        ...config.prices[plano],
        monthly: { ...precos.monthly },
        annual: { ...precos.annual }
      };
    });

    /* Recursos do Enterprise */
    const enterprise = section.querySelector(
      '[data-plan-card="enterprise"] .plan-features ul'
    );

    if (enterprise) {
      enterprise.innerHTML = `
        <li>Até <strong>5.000 perfis/mês</strong></li>
        <li><strong>Usuários ilimitados</strong></li>
        <li><strong>Campanhas ilimitadas</strong></li>
        <li>Suporte prioritário</li>
        <li><strong>Dashboard de produtividade</strong></li>
      `;
    }

    /* Estrutura e recursos do Custom */
    const custom = section.querySelector('.custom-card');

    if (custom) {
      custom.removeAttribute('data-plan-card');
      custom.setAttribute('aria-labelledby', 'custom-plan-title');

      custom.innerHTML = `
        <h3 id="custom-plan-title">Custom</h3>

        <p class="plan-description">
          De acordo com sua necessidade
        </p>

        <div class="price">
          <strong class="custom-message">
            Personalize do seu jeito
          </strong>
        </div>

        <p class="price-detail">
          <span>Proposta sob consulta</span>
          <span class="custom-offer">
            <strong>5% de desconto</strong>
            para volumes acima de 6.000 perfis
          </span>
        </p>

        <a
          class="button button-outline"
          href="#demonstracao"
          data-plan="custom"
        >
          Contratar Custom
        </a>

        <div class="plan-features">
          <p>Configure os recursos do seu plano</p>
          <ul>
            <li>Defina a quantidade de <strong>perfis</strong></li>
            <li>Defina a quantidade de <strong>usuários</strong></li>
            <li><strong>Campanhas ilimitadas</strong></li>
            <li>Opção de <strong>dashboard</strong></li>
          </ul>
        </div>
      `;

      const interest = document.querySelector('#interest');

      if (interest && !interest.querySelector('option[value="custom"]')) {
        const option = document.createElement('option');
        option.value = 'custom';
        option.textContent = 'Custom — plano sob medida';
        interest.append(option);
      }

      custom.querySelector('[data-plan="custom"]')
        .addEventListener('click', () => {
          if (!interest) return;

          interest.value = 'custom';
          interest.dispatchEvent(
            new Event('change', { bubbles: true })
          );
        });
    }

    const moeda = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });

    const numero = new Intl.NumberFormat('pt-BR', {
      maximumFractionDigits: 2
    });

    function exibirPrecos() {
      const selecionado = section.querySelector(
        '[data-period][aria-pressed="true"]'
      );

      const periodo = selecionado?.dataset.period || 'monthly';
      const anual = periodo === 'annual';

      section.dataset.billing = periodo;

      section.querySelectorAll('[data-plan-card]').forEach(card => {
        const plano = card.dataset.planCard;
        const precos = config.prices[plano];

        if (!precos) return;

        const detalhe = card.querySelector('.price-detail');
        const destaque = card.querySelector('[data-price]');
        const unidade = card.querySelector('.price-unit');
        const currency = card.querySelector('.currency');
        const price = card.querySelector('.price');

        if (!detalhe || !destaque || !unidade || !currency || !price) {
          return;
        }

        const atual = precos[periodo];

        if (!atual || !Number.isFinite(atual.standard)) return;

        price.classList.remove('quote');
        currency.hidden = false;
        unidade.hidden = false;
        unidade.textContent = '/mês';

        destaque.textContent = numero.format(
          anual ? atual.standard / 12 : atual.standard
        );

        price.title = anual
          ? `Equivalente mensal do plano anual de ${moeda.format(atual.standard)}`
          : '';

        if (anual) {
          const economia =
            precos.monthly.standard * 12 - atual.standard;

          detalhe.innerHTML = `
            <span class="annual-total">
              ${moeda.format(atual.standard)}/ano
            </span>

            <span class="annual-saving">
              Economize ${moeda.format(economia)}/ano no padrão
            </span>
          `;
        } else {
          detalhe.innerHTML = `
            <span class="saving-label">
              Economize
            </span>

            <span class="pix-price">
              <strong>${moeda.format(atual.pix)}</strong>/mês no Pix
            </span>
          `;
        }
      });
    }

    /* Atualiza depois da lógica de preços existente */
    section.querySelectorAll('[data-period]').forEach(botao => {
      botao.addEventListener('click', exibirPrecos);
    });

    const botaoAtual = section.querySelector(
      '[data-period][aria-pressed="true"]'
    ) || section.querySelector('[data-period="monthly"]');

    if (botaoAtual) {
      botaoAtual.click();
    } else {
      exibirPrecos();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      atualizarPlanos,
      { once: true }
    );
  } else {
    atualizarPlanos();
  }
})();

(() => {
  function aplicarAjustes() {
    const enterprise = document.querySelector(
      '#planos [data-plan-card="enterprise"]'
    );

    if (!enterprise) return;

    const descricao = enterprise.querySelector('.plan-description');

    if (descricao) {
      descricao.textContent = 'Para grandes agências e marcas';
    }

    enterprise.querySelectorAll('.plan-features li').forEach(item => {
      if (item.textContent.trim() === 'Suporte prioritário') {
        const destaque = document.createElement('strong');
        destaque.textContent = 'Suporte prioritário';
        item.replaceChildren(destaque);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarAjustes, {
      once: true
    });
  } else {
    aplicarAjustes();
  }
})();

(() => {
  function ajustarTextosDoSite() {
    // Título das perguntas frequentes
    const tituloFaq = document.querySelector('#faq-title');

    if (tituloFaq) {
      tituloFaq.innerHTML = 'Antes de dar<br>o próximo passo';
    }

    // Título do formulário
    const tituloContato = document.querySelector('#contact-title');

    if (tituloContato) {
      tituloContato.innerHTML =
        'Mais tempo para<br>o que só você<br>sabe fazer';
    }

    // Texto do botão
    const textoBotao = document.querySelector('#submit-label');

    if (textoBotao) {
      textoBotao.textContent = 'Enviar Solicitação';
    }

    // Remover a seta do botão
    document.querySelectorAll(
      '#demo-form .form-submit [aria-hidden="true"]'
    ).forEach(seta => seta.remove());

    // Simplificar o nome do plano no formulário
    const opcaoCustom = document.querySelector(
      '#interest option[value="custom"]'
    );

    if (opcaoCustom) {
      opcaoCustom.textContent = 'Custom';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      ajustarTextosDoSite,
      { once: true }
    );
  } else {
    ajustarTextosDoSite();
  }
})();


/* Ajuste mobile extra�do do backup */
(() => {
    function iniciarAjustesMobile() {
      const pagina = document.documentElement;

      if (pagina.dataset.grapeMobileReady === "true") return;
      pagina.dataset.grapeMobileReady = "true";

      /*
       * Move o elemento no mobile e restaura sua posição
       * original quando a tela volta ao desktop.
       */
      function moverNoMobile(elemento, destino, consulta, primeiro) {
        if (!elemento || !destino) return;

        const posicaoOriginal = document.createComment(
          "Posição original no desktop"
        );

        elemento.before(posicaoOriginal);

        function atualizarPosicao() {
          if (consulta.matches) {
            if (primeiro) {
              destino.prepend(elemento);
            } else {
              destino.append(elemento);
            }
          } else {
            posicaoOriginal.after(elemento);
          }
        }

        consulta.addEventListener("change", atualizarPosicao);
        atualizarPosicao();
      }

      const navegacao = document.getElementById("navegacao");
      const apresentacao = document.querySelector(".hero-grid");
      const faixaRedes = apresentacao?.querySelector(".network-line");

      moverNoMobile(
        faixaRedes,
        apresentacao,
        window.matchMedia("(max-width: 768px)"),
        false
      );
    }

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        iniciarAjustesMobile,
        { once: true }
      );
    } else {
      iniciarAjustesMobile();
    }
  })();



/* Arraste horizontal dos cards de planos em mobile/tablet */
(() => {
  const grids = document.querySelectorAll('.pricing-grid');

  function bind(grid) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    grid.addEventListener('mousedown', (event) => {
      isDown = true;
      grid.classList.add('is-dragging');
      startX = event.pageX - grid.getBoundingClientRect().left;
      scrollLeft = grid.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      if (!isDown) return;
      isDown = false;
      grid.classList.remove('is-dragging');
    });

    grid.addEventListener('mouseleave', () => {
      isDown = false;
      grid.classList.remove('is-dragging');
    });

    grid.addEventListener('mousemove', (event) => {
      if (!isDown) return;
      event.preventDefault();
      const x = event.pageX - grid.getBoundingClientRect().left;
      const walk = x - startX;
      grid.scrollLeft = scrollLeft - walk;
    });
  }

  function init() {
    grids.forEach(bind);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
