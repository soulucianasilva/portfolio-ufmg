// =========================================================
// Carregamento e renderização de cartões a partir dos JSONs
// em data/artigos.json, data/projetos.json e data/formacoes.json
// =========================================================

// Mapeia o texto do status para a classe de cor correspondente.
// Para adicionar um novo status, basta incluir uma nova entrada aqui
// e a classe ".status-..." correspondente em css/style.css.
const STATUS_CLASSES = {
  "Ideia": "status-ideia",
  "Planejamento": "status-planejamento",
  "Em redação": "status-redacao",
  "Revisão": "status-revisao",
  "Submetido": "status-submetido",
  "Publicado": "status-publicado",
  "Em andamento": "status-andamento",
  "Concluído": "status-concluido",
  "Planejado": "status-planejado",
};

function statusClass(status) {
  return STATUS_CLASSES[status] || "status-outro";
}

// Evita problemas de injeção de HTML ao inserir texto vindo dos JSONs.
function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
}

// Converte "AAAA-MM-DD" para "DD/MM/AAAA" sem usar Date()
// (evita deslocamento de fuso horário).
function formatarData(isoDate) {
  if (!isoDate) return "";
  const partes = isoDate.split("-");
  if (partes.length !== 3) return isoDate;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

function statusBadge(status) {
  if (!status) return "";
  return `<span class="status ${statusClass(status)}">${escapeHtml(status)}</span>`;
}

// ---------------------------------------------------------
// Produções e Artigos (data/artigos.json)
// Campos: titulo, status, prazo, link
// ---------------------------------------------------------
function renderArtigos(itens, container) {
  container.innerHTML = itens.map((item) => {
    const prazoHtml = item.prazo
      ? `<p class="meta">Prazo: ${escapeHtml(formatarData(item.prazo))}</p>`
      : "";

    const linkHtml = item.link
      ? `<a class="card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Ver detalhes <i class="ti ti-external-link"></i></a>`
      : "";

    return `
      <article class="list-card">
        <div class="card-top">
          <h2>${escapeHtml(item.titulo)}</h2>
          ${statusBadge(item.status)}
        </div>
        ${prazoHtml}
        ${linkHtml}
      </article>
    `;
  }).join("");
}

// ---------------------------------------------------------
// Projetos e Pesquisa (data/projetos.json)
// Campos: titulo, descricao, status
// ---------------------------------------------------------
function renderProjetos(itens, container) {
  container.innerHTML = itens.map((item) => {
    const linkHtml = item.link
      ? `<a class="card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Ver detalhes <i class="ti ti-external-link"></i></a>`
      : "";

    const prazoHtml = item.prazo
      ? `<p class="meta">Prazo: ${escapeHtml(formatarData(item.prazo))}</p>`
      : "";

    return `
      <article class="list-card">
        <div class="card-top">
          <h2>${escapeHtml(item.titulo)}</h2>
          ${statusBadge(item.status)}
        </div>
        ${item.descricao ? `<p class="description">${escapeHtml(item.descricao)}</p>` : ""}
        ${prazoHtml}
        ${linkHtml}
      </article>
    `;
  }).join("");
}

// ---------------------------------------------------------
// Formações (data/formacoes.json)
// Campos: titulo, publico, periodo, (status e link opcionais)
// ---------------------------------------------------------
function renderFormacoes(itens, container) {
  container.innerHTML = itens.map((item) => {
    const linkHtml = item.link
      ? `<a class="card-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener">Ver detalhes <i class="ti ti-external-link"></i></a>`
      : "";

    return `
      <article class="list-card">
        <div class="card-top">
          <h2>${escapeHtml(item.titulo)}</h2>
          ${statusBadge(item.status)}
        </div>
        ${item.publico ? `<p class="meta">Público-alvo: ${escapeHtml(item.publico)}</p>` : ""}
        ${item.periodo ? `<p class="description">Período: ${escapeHtml(item.periodo)}</p>` : ""}
        ${linkHtml}
      </article>
    `;
  }).join("");
}

// ---------------------------------------------------------
// Publicações (data/publicacoes.json)
// Campos: referencia, (nota opcional)
// ---------------------------------------------------------
function renderPublicacoes(itens, container) {
  container.innerHTML = itens.map((item) => {
    const notaHtml = item.nota
      ? `<p class="meta">${escapeHtml(item.nota)}</p>`
      : "";

    return `
      <article class="list-card">
        <p class="description">${escapeHtml(item.referencia)}</p>
        ${notaHtml}
      </article>
    `;
  }).join("");
}

function carregarPublicacoes() {
  const containers = {
    artigos_periodicos: document.getElementById("artigos-periodicos-list"),
    livros: document.getElementById("livros-list"),
    capitulos: document.getElementById("capitulos-list"),
  };

  if (!containers.artigos_periodicos && !containers.livros && !containers.capitulos) return;

  fetch("data/publicacoes.json")
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Não foi possível carregar data/publicacoes.json (HTTP ${resposta.status})`);
      }
      return resposta.json();
    })
    .then((dados) => {
      Object.entries(containers).forEach(([chave, container]) => {
        if (container) renderPublicacoes(dados[chave] || [], container);
      });
    })
    .catch((erro) => {
      console.error(erro);
      Object.values(containers).forEach((container) => {
        if (container) {
          container.innerHTML = `
            <p class="meta">
              Não foi possível carregar o conteúdo (data/publicacoes.json).
              Se você abriu este arquivo diretamente no navegador, rode um servidor
              local (por exemplo "python -m http.server") e acesse pelo localhost.
            </p>
          `;
        }
      });
    });
}

// ---------------------------------------------------------
// Carregamento genérico de JSON com mensagens de erro amigáveis
// ---------------------------------------------------------
function carregarCards(caminhoJson, containerId, renderFn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  fetch(caminhoJson)
    .then((resposta) => {
      if (!resposta.ok) {
        throw new Error(`Não foi possível carregar ${caminhoJson} (HTTP ${resposta.status})`);
      }
      return resposta.json();
    })
    .then((dados) => renderFn(dados, container))
    .catch((erro) => {
      console.error(erro);
      container.innerHTML = `
        <p class="meta">
          Não foi possível carregar o conteúdo (${escapeHtml(caminhoJson)}).
          Se você abriu este arquivo diretamente no navegador, rode um servidor
          local (por exemplo "python -m http.server") e acesse pelo localhost.
        </p>
      `;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  carregarCards("data/artigos.json", "producoes-list", renderArtigos);
  carregarCards("data/projetos.json", "projetos-list", renderProjetos);
  carregarCards("data/formacoes.json", "formacoes-list", renderFormacoes);
  carregarPublicacoes();
});
