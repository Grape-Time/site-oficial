/*
 * Grape — atualização localizada da seção de planos, versão 2.
 * Coloque este arquivo na pasta grape-site-oficial e execute:
 * node .\Atualizar-Planos-Grape.cjs
 * Requer Node.js 18 ou superior. Não instala dependências nem acessa a rede.
 * Cria um backup de index.html, assets/css/styles.css e assets/js/main.js.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const MARKER = 'GRAPE CUSTOM PLANS V2';
const customCard = `
          <article class="plan-card custom-card" aria-labelledby="custom-plan-title">
            <h3 id="custom-plan-title">Custom</h3>
            <div class="custom-copy">
              <p class="custom-headline">Personalize do seu jeito</p>
              <p class="custom-description">Defina o volume de perfis, o tamanho da equipe e os recursos de acordo com sua necessidade</p>
            </div>
            <a class="button button-outline" href="#demonstracao" data-plan="custom">Contratar Custom</a>
          </article>`;

const pricingCss = `/* ${MARKER} START */
#planos .eyebrow {
  font-size: clamp(24px, 2vw, 28px);
  font-weight: 750;
  line-height: 1.25;
  letter-spacing: -.4px;
  text-transform: none;
  margin-bottom: 14px;
  color: var(--purple);
}
#planos .eyebrow::before { display: none; }
#planos #pricing-title {
  font-size: clamp(30px, 3vw, 40px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -1.3px;
}
#planos .section-intro { max-width: 980px; }
#planos .pricing-controls { margin-top: 28px; justify-content: center; }
#planos .pricing-controls .control-group { justify-content: center; gap: 0; }
#planos .pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  margin-top: 42px;
}
#planos .plan-card {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 26px 22px;
}
#planos .recommended { padding: 25px 21px; }
#planos .plan-card h3 { font-size: 22px; }
#planos .plan-description { min-height: 50px; margin-top: 12px; }
#planos .price { min-height: 54px; gap: 5px; }
#planos .price strong { font-size: 38px; letter-spacing: -1.5px; }
#planos .price .currency { font-size: 16px; padding-top: 8px; }
#planos .price.quote strong { font-size: 25px; letter-spacing: -.7px; padding-top: 10px; }
#planos .price-detail {
  min-height: 44px;
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--muted);
}
#planos .price-detail .pix-price { display: block; color: var(--green); }
#planos .price-detail strong { font-weight: 700; }
#planos .plan-card > .button {
  min-height: 54px;
  margin-top: 20px;
  padding: 10px 12px;
  gap: 8px;
  font-size: 12px;
}
#planos .plan-features { margin-top: 24px; }
#planos .plan-features > p { min-height: 36px; font-size: 11px; }
#planos .plan-features li { font-size: 12px; }
#planos .custom-card {
  background: var(--purple-dark);
  border-color: var(--purple-dark);
  color: #fff;
  justify-content: center;
  padding: 34px 24px;
}
#planos .custom-card h3 { color: var(--yellow); margin-bottom: 26px; }
#planos .custom-headline {
  font-size: clamp(28px, 2.3vw, 34px);
  font-weight: 750;
  line-height: 1.15;
  letter-spacing: -1px;
  color: #fff;
}
#planos .custom-description {
  margin-top: 20px;
  font-size: 15px;
  line-height: 1.75;
  color: rgba(255, 255, 255, .85);
}
#planos .custom-card > .button {
  margin-top: 32px;
  background: #fff;
  border-color: #fff;
  color: var(--purple-dark);
}
#planos .custom-card > .button:hover {
  background: var(--yellow);
  border-color: var(--yellow);
}
/* Aviso para leitores de tela ao alternar Mensal/Anual. */
#planos #pricing-status {
  position: absolute;
  width: 1px;
  height: 1px;
  min-height: 0;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
@media (max-width: 1199px) {
  #planos .pricing-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px 22px; }
}
@media (max-width: 640px) {
  #planos .eyebrow { font-size: 24px; }
  #planos .pricing-grid { grid-template-columns: minmax(0, 1fr); }
  #planos .plan-card { padding: 28px; }
  #planos .recommended { padding: 27px; }
  #planos .plan-description { min-height: 0; }
  #planos .price strong { font-size: 44px; }
  #planos .price.quote strong { font-size: 29px; }
  #planos .plan-features > p { min-height: 0; }
  #planos .custom-card { padding: 36px 28px; }
}
/* ${MARKER} END */`;

const updateFunction = `  function updatePrices() {
    // ${MARKER}: preço padrão em destaque; Pix como informação complementar.
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
      if (pixKnown) {
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
  }`;

function replaceExactlyOnce(source, regex, replacement, label) {
  const matches = [...source.matchAll(new RegExp(regex.source, 'g'))];
  if (matches.length !== 1) throw new Error('Não encontrei uma única estrutura de ' + label + '. Nenhum arquivo foi alterado.');
  return source.replace(regex, () => typeof replacement === 'function' ? replacement(matches[0]) : replacement);
}

function transform(files) {
  let html = files.html;
  let js = files.js;
  const sectionRegex = /<section\b[^>]*\bid=["']planos["'][^>]*>[\s\S]*?<\/section>/;
  html = replaceExactlyOnce(html, sectionRegex, match => {
    const section = match[0];
    const cards = [...section.matchAll(/<article\b[^>]*\bdata-plan-card=["']([^"']+)["'][^>]*>[\s\S]*?<\/article>/g)];
    const ids = ['essential', 'professional', 'enterprise'];
    for (const id of ids) {
      if (cards.filter(card => card[1] === id).length !== 1) throw new Error('Card ausente ou duplicado: ' + id);
    }
    if (cards.some(card => !ids.includes(card[1]) && card[1] !== 'custom')) throw new Error('Há outro plano não previsto. Atualização interrompida para preservar seu conteúdo.');
    for (const card of cards) {
      for (const token of ['data-price', 'currency', 'price-unit', 'price-detail']) {
        if (!card[0].includes(token)) throw new Error('Estrutura de preços diferente da esperada: ' + card[1]);
      }
    }
    const names = { essential: 'Essential', professional: 'Professional', enterprise: 'Enterprise' };
    const baseCards = ids.map(id => {
      let card = cards.find(card => card[1] === id)[0].replace(
        /(<p\b[^>]*class=["']price-detail["'][^>]*>)[\s\S]*?(<\/p>)/,
        '$1Condições de pagamento sob consulta$2'
      );
      card = replaceExactlyOnce(card, /(<p\b[^>]*class=["']plan-description["'][^>]*>)([\s\S]*?)(<\/p>)/, parts => {
        const description = parts[2].replace(/<br\s*\/?\s*>/gi, ' ').replace(/\s+/g, ' ').trim().replace(/\.+$/, '');
        return parts[1] + description + parts[3];
      }, 'descrição do ' + names[id]);
      card = replaceExactlyOnce(card, /(<a\b[^>]*\bdata-plan=["'][^"']+["'][^>]*>)[\s\S]*?(<\/a>)/,
        parts => parts[1] + 'Contratar ' + names[id] + parts[2], 'botão do ' + names[id]);
      return card;
    });
    return `<section class="section pricing" id="planos" aria-labelledby="pricing-title">
      <div class="container">
        <div class="section-center">
          <p class="eyebrow">Planos e preços</p>
          <h2 id="pricing-title">O tamanho certo para a sua operação</h2>
          <p class="section-intro">Da curadoria independente à gestão de grandes equipes. Escolha o plano que acompanha a sua rotina</p>
        </div>
        <div class="pricing-controls">
          <div class="control-group"><div class="segmented" role="group" aria-label="Período de contratação"><button type="button" class="selected" data-period="monthly" aria-pressed="true">Mensal</button><button type="button" data-period="annual" aria-pressed="false">Anual</button></div></div>
        </div>
        <p id="pricing-status" role="status" aria-atomic="true"></p>
        <div class="pricing-grid">
          ${baseCards.join('\n          ')}${customCard}
        </div>
      </div>
    </section>`;
  }, 'seção de planos');
  html = replaceExactlyOnce(html, /<select\b[^>]*\bid=["']interest["'][^>]*>[\s\S]*?<\/select>/, match => {
    if (/value=["']custom["']/.test(match[0])) return match[0];
    return match[0].replace('</select>', '<option value="custom">Custom — plano sob medida</option></select>');
  }, 'seleção de plano no formulário');
  js = replaceExactlyOnce(js, /const planNames\s*=\s*\{[^}]*\};/, match => {
    if (/\bcustom\s*:/.test(match[0])) return match[0];
    return match[0].replace(/\s*\};$/, ", custom: 'Custom' };");
  }, 'nomes dos planos');
  js = replaceExactlyOnce(js, /  function updatePrices\(\) \{[\s\S]*?\r?\n  \}(?=\s*\$\$\('\[data-period\]'\)\.forEach)/, updateFunction, 'atualização de preços');
  // O seletor de pagamento saiu da interface. O preço principal permanece padrão.
  js = js.replace(/(const state\s*=\s*\{[^}]*\bpayment:\s*)['"]pix['"]/, "$1'standard'");
  new vm.Script(js, { filename: 'assets/js/main.js' });
  const oldBlock = /\n?\/\* GRAPE CUSTOM PLANS V\d+ START \*\/[\s\S]*?\/\* GRAPE CUSTOM PLANS V\d+ END \*\//g;
  const css = files.css.replace(oldBlock, '').trimEnd() + '\n\n' + pricingCss + '\n';
  return { html, css, js };
}

function main() {
  const root = path.resolve(process.argv[2] || __dirname);
  const paths = { html: 'index.html', css: 'assets/css/styles.css', js: 'assets/js/main.js' };
  const before = {};
  for (const [key, relative] of Object.entries(paths)) {
    before[key] = fs.readFileSync(path.join(root, relative), 'utf8');
  }
  const after = transform(before);
  const changed = Object.keys(paths).filter(key => before[key] !== after[key]);
  if (!changed.length) { console.log('A seção de planos já está atualizada.'); return; }
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backup = path.join(root, 'backups', 'planos-custom-' + stamp);
  // Todos os backups são criados antes da primeira alteração.
  for (const [key, relative] of Object.entries(paths)) {
    const destination = path.join(backup, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, relative), destination);
  }
  try {
    for (const key of changed) fs.writeFileSync(path.join(root, paths[key]), after[key], 'utf8');
  } catch (error) {
    const failed = [];
    for (const key of changed) {
      try { fs.copyFileSync(path.join(backup, paths[key]), path.join(root, paths[key])); }
      catch { failed.push(paths[key]); }
    }
    if (failed.length) throw new Error('Falha ao gravar/restaurar ' + failed.join(', ') + '. Restaure a partir de: ' + backup);
    throw new Error('Falha ao gravar. Os originais foram restaurados. ' + error.message);
  }
  console.log('Planos atualizados (versão 2): Essential, Professional, Enterprise e Custom.');
  console.log('Backup: ' + backup);
  console.log('Atualize o navegador com Ctrl + F5. Se estiver usando dist, execute npm run build.');
}

if (require.main === module) {
  try { main(); }
  catch (error) { console.error('Atualização interrompida: ' + error.message); process.exitCode = 1; }
}
module.exports = { transform, updateFunction };
