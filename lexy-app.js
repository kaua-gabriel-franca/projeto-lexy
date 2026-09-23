/* LEXY - lógica do esboço */

// ---------- BASE DE DADOS TEMPORÁRIA ----------
const BASE_LOCAL = {
    banco: {
        palavra: "Banco",
        classe: "Substantivo",
        significado: "Instituição onde são realizadas operações financeiras.",
        outrosSignificados: ["Assento comprido usado para sentar.", "Conjunto organizado de dados (banco de dados)."],
        exemplos: ["Preciso ir ao banco amanhã.", "João sentou no banco da praça."],
        sinonimos: ["instituição financeira", "assento"],
        antonimos: [],
        polissemia: "Sim. A palavra possui diferentes sentidos dependendo do contexto.",
        contexto: "Em 'Fui ao banco pagar uma conta', banco é instituição financeira. Em 'Pedro sentou no banco', é um assento.",
        variacao: "Em algumas regiões, o assento de praça também é chamado de 'banquinho'.",
    },
    perspicaz: {
        palavra: "Perspicaz",
        classe: "Adjetivo",
        significado: "Pessoa que percebe e entende algo com facilidade.",
        outrosSignificados: [],
        exemplos: ["O aluno foi perspicaz ao perceber o problema."],
        sinonimos: ["atento", "observador", "inteligente"],
        antonimos: ["distraído", "desatento"],
        polissemia: "Não. O sentido se mantém parecido em diferentes contextos.",
        contexto: "Costuma descrever alguém com raciocínio rápido.",
        variacao: "Palavra de uso mais formal, comum em textos escritos.",
    },
    efemero: {
        palavra: "Efêmero",
        classe: "Adjetivo",
        significado: "Que dura pouco tempo, passageiro.",
        outrosSignificados: [],
        exemplos: ["A fama pode ser efêmera.", "Foi um momento efêmero, mas inesquecível."],
        sinonimos: ["passageiro", "breve", "temporário"],
        antonimos: ["eterno", "duradouro"],
        polissemia: "Não.",
        contexto: "Usada para falar de coisas que acabam rápido.",
        variacao: "Comum em textos literários.",
    },
    ambiguo: {
        palavra: "Ambíguo",
        classe: "Adjetivo",
        significado: "Que pode ter mais de um sentido, duvidoso.",
        outrosSignificados: ["Que não é claro nem definido."],
        exemplos: ["A frase ficou ambígua e confundiu os leitores."],
        sinonimos: ["dúbio", "impreciso"],
        antonimos: ["claro", "preciso"],
        polissemia: "Sim, dependendo do contexto pode indicar dúvida ou falta de clareza.",
        contexto: "Muito usada ao analisar frases na escrita.",
        variacao: "Uso formal.",
    },
    meticuloso: {
        palavra: "Meticuloso",
        classe: "Adjetivo",
        significado: "Que cuida dos detalhes com muito capricho.",
        outrosSignificados: [],
        exemplos: ["Ele é meticuloso ao revisar as redações."],
        sinonimos: ["detalhista", "caprichoso"],
        antonimos: ["descuidado", "relaxado"],
        polissemia: "Não.",
        contexto: "Descreve alguém atento aos detalhes.",
        variacao: "Uso comum em todo o país.",
    },
    resiliencia: {
        palavra: "Resiliência",
        classe: "Substantivo",
        significado: "Capacidade de se recuperar diante de dificuldades.",
        outrosSignificados: ["Na física, capacidade de um material voltar à forma original."],
        exemplos: ["A resiliência dela ajudou a superar o problema."],
        sinonimos: ["persistência", "força"],
        antonimos: ["fragilidade"],
        polissemia: "Sim: sentido emocional e sentido científico.",
        contexto: "No dia a dia, fala sobre superação.",
        variacao: "Muito usada em textos escolares e jornalísticos.",
    },
    };

    const semAcento = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    // ---------- API DO DICIONÁRIO (Dicionário Aberto - gratuita, sem chave) ----------
    const API = "https://api.dicionario-aberto.net";

    const CLASSES = {
    "adj": "Adjetivo", "adj.": "Adjetivo", "s.": "Substantivo", "s. m.": "Substantivo",
    "s. f.": "Substantivo", "m.": "Substantivo", "f.": "Substantivo", "v.": "Verbo",
    "v. t.": "Verbo", "v. i.": "Verbo", "v. p.": "Verbo", "adv.": "Advérbio",
    "prep.": "Preposição", "conj.": "Conjunção", "pron.": "Pronome", "interj.": "Interjeição",
    "num.": "Numeral", "art.": "Artigo",
    };

    function traduzirClasse(g) {
    if (!g) return "Não informada";
    const chave = g.trim().toLowerCase();
    return CLASSES[chave] || g.trim();
    }

    function limpar(t) {
    return t.replace(/_/g, "").replace(/\s+/g, " ").trim();
    }

    function converterEntrada(entradas, termo) {
    const significados = [];
    let classe = "";

    entradas.forEach((e) => {
        const doc = new DOMParser().parseFromString(e.xml, "text/xml");
        doc.querySelectorAll("sense").forEach((s) => {
        if (!classe) classe = traduzirClasse(s.querySelector("gramGrp")?.textContent);
        s.querySelectorAll("def").forEach((d) => {
            limpar(d.textContent)
            .split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÀÇ])/)
            .map(limpar)
            .filter((x) => x.length > 2)
            .forEach((x) => { if (!significados.includes(x)) significados.push(x); });
        });
        });
    });

    if (!significados.length) return null;

    const palavra = entradas[0].word || termo;
    const polissemica = significados.length > 1;

    return {
        palavra: palavra.charAt(0).toUpperCase() + palavra.slice(1),
        classe: classe || "Não informada",
        significado: significados[0],
        outrosSignificados: significados.slice(1),
        exemplos: [`Procure usar "${palavra}" em uma frase sua para memorizar melhor.`],
        sinonimos: [],
        antonimos: [],
        polissemia: polissemica
        ? `Sim. Esta palavra tem ${significados.length} sentidos registrados no dicionário.`
        : "Não foram registrados outros sentidos para esta palavra.",
        contexto: polissemica
        ? "Observe a frase inteira para saber qual dos sentidos está sendo usado."
        : "O sentido costuma se manter parecido em diferentes contextos.",
        variacao: "Consulta feita no acervo do Dicionário Aberto da língua portuguesa.",
        fonte: "Dicionário Aberto",
    };
    }

    async function buscarPalavra(termo) {
    const chave = semAcento(termo);
    if (BASE_LOCAL[chave]) return BASE_LOCAL[chave];

    const resposta = await fetch(`${API}/word/${encodeURIComponent(termo.trim().toLowerCase())}`);
    if (!resposta.ok) throw new Error("falha");
    const entradas = await resposta.json();
    if (!Array.isArray(entradas) || !entradas.length) return null;
    return converterEntrada(entradas, termo);
    }

    async function palavrasParecidas(termo) {
    try {
        const r = await fetch(`${API}/near/${encodeURIComponent(termo.trim().toLowerCase())}`);
        const lista = await r.json();
        return Array.isArray(lista) ? lista.slice(0, 6) : [];
    } catch {
        return [];
    }
    }

    // ---------- ARMAZENAMENTO ----------
    const dados = {
    vocabulario: JSON.parse(localStorage.getItem("lexy_vocabulario") || "[]"),
    historico: JSON.parse(localStorage.getItem("lexy_historico") || "[]"),
    nome: localStorage.getItem("lexy_nome") || "",
    };

    function salvarTudo() {
    localStorage.setItem("lexy_vocabulario", JSON.stringify(dados.vocabulario));
    localStorage.setItem("lexy_historico", JSON.stringify(dados.historico));
    localStorage.setItem("lexy_nome", dados.nome);
    if (window.parent !== window) {
        window.parent.postMessage({ type: "lexy-study-data", payload: dados }, window.location.origin);
    }
    }

    // ---------- NAVEGAÇÃO ----------
    function mostrarTela(id) {
    document.querySelectorAll(".tela").forEach((s) => s.classList.toggle("ativa", s.id === id));
    document.querySelectorAll("nav.menu button").forEach((b) => b.classList.toggle("ativo", b.dataset.tela === id));
    window.scrollTo(0, 0);
    if (id === "tela-vocabulario") renderVocabulario();
    if (id === "tela-perfil") renderPerfil();
    if (id === "tela-revisao") novaRevisao();
    }

    document.querySelectorAll("nav.menu button").forEach((b) => b.addEventListener("click", () => mostrarTela(b.dataset.tela)));
    document.getElementById("btn-topo-vocab").addEventListener("click", () => mostrarTela("tela-vocabulario"));
    document.getElementById("btn-voltar").addEventListener("click", () => mostrarTela("tela-inicio"));

    // ---------- PESQUISA ----------
    const erroEl = document.getElementById("mensagem-erro");

    document.getElementById("form-busca").addEventListener("submit", (e) => {
    e.preventDefault();
    pesquisar(document.getElementById("campo-busca").value);
    });

    function mostrarErro(html) {
    erroEl.innerHTML = html;
    erroEl.hidden = false;
    }

    async function pesquisar(termo) {
    erroEl.hidden = true;
    if (!termo.trim()) {
        mostrarErro("Digite uma palavra para pesquisar.");
        return;
    }

    const botao = document.querySelector("#form-busca button[type=submit]");
    const textoBotao = botao ? botao.textContent : "";
    if (botao) { botao.disabled = true; botao.textContent = "Pesquisando..."; }
    mostrarErro("Consultando o dicionário...");

    try {
        const resultado = await buscarPalavra(termo);
        if (!resultado) {
        const parecidas = await palavrasParecidas(termo);
        mostrarErro(
            `Não encontramos "${termo}" no dicionário. Confira a escrita.` +
            (parecidas.length ? `<br>Talvez você queira: ${parecidas.join(", ")}` : "")
        );
        return;
        }
        erroEl.hidden = true;
        dados.historico.unshift({ palavra: resultado.palavra, data: new Date().toLocaleString("pt-BR") });
        dados.historico = dados.historico.slice(0, 20);
        salvarTudo();
        renderRecentes();
        mostrarPalavra(resultado);
    } catch {
        mostrarErro("Não foi possível consultar o dicionário agora. Verifique sua conexão e tente de novo.");
    } finally {
        if (botao) { botao.disabled = false; botao.textContent = textoBotao; }
    }
    }

    function lista(itens) {
    return itens.map((i) => `<span class="etiqueta">${i}</span>`).join("");
    }

    function mostrarPalavra(p) {
    const salva = dados.vocabulario.find((v) => semAcento(v.palavra) === semAcento(p.palavra));
    document.getElementById("conteudo-palavra").innerHTML = `
        <div class="cartao">
        <h1 class="palavra-titulo">${p.palavra}</h1>
        <p class="classe">Classe gramatical: ${p.classe}</p>

        <div class="bloco"><span class="rotulo">Significado</span>${p.significado}</div>
        ${p.outrosSignificados.length ? `<div class="bloco"><span class="rotulo">Outros significados</span>${p.outrosSignificados.map((s) => `<p class="exemplo">${s}</p>`).join("")}</div>` : ""}
        <div class="bloco"><span class="rotulo">Exemplos</span>${p.exemplos.map((e) => `<p class="exemplo">"${e}"</p>`).join("")}</div>
        ${p.sinonimos.length ? `<div class="bloco"><span class="rotulo">Sinônimos</span><div class="etiquetas">${lista(p.sinonimos)}</div></div>` : ""}
        ${p.antonimos.length ? `<div class="bloco"><span class="rotulo">Antônimos</span><div class="etiquetas">${lista(p.antonimos)}</div></div>` : ""}
        <div class="bloco"><span class="rotulo">Polissemia</span>${p.polissemia}</div>
        <div class="bloco"><span class="rotulo">Uso no contexto</span>${p.contexto}</div>
        <div class="bloco"><span class="rotulo">Variação linguística</span>${p.variacao}</div>

        <button id="btn-adicionar">${salva ? "✓ Já está no meu vocabulário" : "+ ADICIONAR AO MEU VOCABULÁRIO"}</button>
        </div>
        <div class="cartao">
        <span class="rotulo">Minha anotação</span>
        <textarea id="campo-anotacao" placeholder="Ex.: encontrei essa palavra no livro que estou lendo.">${salva ? salva.anotacao || "" : ""}</textarea>
        <button class="secundario pequeno" id="btn-anotacao" style="margin-top:10px">Salvar anotação</button>
        </div>`;

    document.getElementById("btn-adicionar").addEventListener("click", () => {
        adicionarVocabulario(p);
        mostrarPalavra(p);
    });
    document.getElementById("btn-anotacao").addEventListener("click", () => {
        adicionarVocabulario(p);
        const item = dados.vocabulario.find((v) => semAcento(v.palavra) === semAcento(p.palavra));
        item.anotacao = document.getElementById("campo-anotacao").value;
        salvarTudo();
        alert("Anotação salva!");
    });

    mostrarTela("tela-palavra");
    }

    function adicionarVocabulario(p) {
    if (dados.vocabulario.some((v) => semAcento(v.palavra) === semAcento(p.palavra))) return;
    dados.vocabulario.push({ ...p, data: new Date().toLocaleDateString("pt-BR"), anotacao: "", favorito: false });
    salvarTudo();
    }

    // ---------- RECENTES E SUGESTÕES ----------
    function renderRecentes() {
    const el = document.getElementById("lista-recentes");
    if (!dados.historico.length) {
        el.innerHTML = '<span class="aviso">Nenhuma pesquisa ainda.</span>';
        return;
    }
    el.innerHTML = "";
    [...new Set(dados.historico.map((h) => h.palavra))].slice(0, 8).forEach((w) => {
        const b = document.createElement("button");
        b.className = "pequeno";
        b.textContent = w;
        b.addEventListener("click", () => pesquisar(w));
        el.appendChild(b);
    });
    }

    function renderSugestoes() {
    const el = document.getElementById("lista-sugestoes");
    el.innerHTML = "";
    Object.values(BASE_LOCAL).forEach((p) => {
        const b = document.createElement("button");
        b.className = "pequeno";
        b.textContent = p.palavra;
        b.addEventListener("click", () => pesquisar(p.palavra));
        el.appendChild(b);
    });
    }

    // ---------- VOCABULÁRIO ----------
    let apenasFavoritas = false;
    document.getElementById("btn-so-favoritas").addEventListener("click", (e) => {
    apenasFavoritas = !apenasFavoritas;
    e.target.textContent = apenasFavoritas ? "Mostrar todas" : "Só favoritas";
    renderVocabulario();
    });
    document.getElementById("filtro-vocab").addEventListener("input", renderVocabulario);

    function renderVocabulario() {
    const filtro = semAcento(document.getElementById("filtro-vocab").value);
    const ul = document.getElementById("lista-vocabulario");
    const itens = dados.vocabulario
        .filter((v) => semAcento(v.palavra).includes(filtro))
        .filter((v) => (apenasFavoritas ? v.favorito : true));

    ul.innerHTML = "";
    document.getElementById("vocab-vazio").hidden = itens.length > 0;

    itens.forEach((v) => {
        const li = document.createElement("li");
        const info = document.createElement("div");
        info.innerHTML = `<span class="item-palavra">${v.palavra}</span><br><small class="aviso">${v.classe} · salva em ${v.data}${v.anotacao ? " · anotação" : ""}</small>`;
        info.querySelector(".item-palavra").addEventListener("click", () => mostrarPalavra(v));

        const acoes = document.createElement("div");
        acoes.className = "item-acoes";

        const fav = document.createElement("button");
        fav.className = "estrela" + (v.favorito ? " ativa" : "");
        fav.textContent = "★";
        fav.title = "Favoritar";
        fav.addEventListener("click", () => { v.favorito = !v.favorito; salvarTudo(); renderVocabulario(); });

        const ver = document.createElement("button");
        ver.className = "secundario pequeno";
        ver.textContent = "Ver";
        ver.addEventListener("click", () => mostrarPalavra(v));

        const del = document.createElement("button");
        del.className = "perigo pequeno";
        del.textContent = "Excluir";
        del.addEventListener("click", () => {
        if (!confirm(`Excluir "${v.palavra}" do seu vocabulário?`)) return;
        dados.vocabulario = dados.vocabulario.filter((x) => x !== v);
        salvarTudo();
        renderVocabulario();
        });

        acoes.append(fav, ver, del);
        li.append(info, acoes);
        ul.appendChild(li);
    });
    }

    // ---------- REVISÃO ----------
    function novaRevisao() {
    const area = document.getElementById("area-revisao");
    if (dados.vocabulario.length < 2) {
        area.innerHTML = '<p class="aviso">Salve pelo menos 2 palavras para começar a revisar.</p>';
        return;
    }
    const certa = dados.vocabulario[Math.floor(Math.random() * dados.vocabulario.length)];
    const opcoes = [...dados.vocabulario].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!opcoes.includes(certa)) opcoes[0] = certa;
    opcoes.sort(() => Math.random() - 0.5);

    area.innerHTML = `<span class="rotulo">Qual palavra significa:</span><p>"${certa.significado}"</p><div id="opcoes" class="recentes"></div><p id="resultado"></p>`;
    const cont = area.querySelector("#opcoes");
    opcoes.forEach((o) => {
        const b = document.createElement("button");
        b.className = "secundario";
        b.textContent = o.palavra;
        b.addEventListener("click", () => {
        const res = area.querySelector("#resultado");
        res.textContent = o === certa ? "✓ Correto!" : `✗ A resposta certa era ${certa.palavra}.`;
        setTimeout(novaRevisao, 1500);
        });
        cont.appendChild(b);
    });
    }

    // ---------- PERFIL ----------
    document.getElementById("btn-salvar-nome").addEventListener("click", () => {
    dados.nome = document.getElementById("campo-nome").value;
    salvarTudo();
    alert("Nome salvo!");
    });
    document.getElementById("btn-limpar").addEventListener("click", () => {
    if (!confirm("Isso apagará seu vocabulário e histórico. Continuar?")) return;
    dados.vocabulario = [];
    dados.historico = [];
    dados.nome = "";
    salvarTudo();
    renderPerfil();
    renderRecentes();
    });

    document.getElementById("btn-criar-conta").addEventListener("click", () => {
    const erroConta = document.getElementById("erro-conta");
    erroConta.hidden = true;
    if (window.parent === window) {
        window.location.href = "/?auth=google";
        return;
    }
    window.parent.postMessage({ type: "lexy-google-auth" }, window.location.origin);
    });

    document.getElementById("btn-sair").addEventListener("click", () => {
    if (window.parent !== window) window.parent.postMessage({ type: "lexy-sign-out" }, window.location.origin);
    });

    window.addEventListener("message", (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === "lexy-auth-state") {
        const user = event.data.user;
        document.getElementById("conta-desconectada").hidden = Boolean(user);
        document.getElementById("conta-conectada").hidden = !user;
        if (user) {
        document.getElementById("nome-google").textContent = user.name || "Estudante";
        document.getElementById("email-google").textContent = user.email || "";
        const foto = document.getElementById("foto-google");
        foto.hidden = !user.avatar;
        if (user.avatar) foto.src = user.avatar;
        }
    }
    if (event.data?.type === "lexy-auth-error") {
        const erroConta = document.getElementById("erro-conta");
        erroConta.textContent = event.data.message || "Não foi possível entrar com o Google.";
        erroConta.hidden = false;
    }
    if (event.data?.type === "lexy-open-profile") mostrarTela("tela-perfil");
    });

    function renderPerfil() {
    document.getElementById("campo-nome").value = dados.nome;
    document.getElementById("est-salvas").textContent = dados.vocabulario.length;
    document.getElementById("est-favoritas").textContent = dados.vocabulario.filter((v) => v.favorito).length;
    document.getElementById("est-pesquisas").textContent = dados.historico.length;
    const ul = document.getElementById("lista-historico");
    ul.innerHTML = dados.historico.length
        ? dados.historico.map((h) => `<li><span class="item-palavra">${h.palavra}</span><small class="aviso">${h.data}</small></li>`).join("")
        : '<li class="aviso">Sem pesquisas registradas.</li>';
    }

// ---------- INÍCIO ----------
renderSugestoes();
renderRecentes();
if (window.parent !== window) window.parent.postMessage({ type: "lexy-ready" }, window.location.origin);
