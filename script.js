const hoje = new Date().toISOString().split("T")[0];
const cabeca = document.querySelector(".cabaca");
const lista_itens = document.querySelector(".lista");
const button_add = document.querySelector(".button_add");
const pesquise = document.querySelector(".pesquisa");

const additem = document.querySelector(".additem");
const fechar = document.querySelector(".back");
const texto = document.querySelector(".textoV");
const data = document.querySelector(".dataV");
data.setAttribute("min", hoje);

const permitirHorario = document.querySelector(".PtempoV");
const tempo = document.querySelector(".tempoV");
const concluir = document.querySelector(".concluir");
const menu_del = document.querySelector(".menu_del");

// Event Listeners
concluir.addEventListener("click", verificarcaixa);
fechar.addEventListener("click", fecharadd);
button_add.addEventListener("click", abaadd);
menu_del.addEventListener("click", deletar);

pesquise.addEventListener("input", () => {
  const termo = pesquise.value.toLowerCase().trim();
  pesquisar(termo);
});

permitirHorario.addEventListener("click", verificar);

if (additem && additem.parentNode) {
  document.body.removeChild(additem);
}

let lista = JSON.parse(localStorage.getItem("lista")) || {};
let selecionado = [];

function verificar() {
  if (!permitirHorario.checked) {
    tempo.setAttribute("disabled", "true");
  } else {
    tempo.removeAttribute("disabled");
  }
}

function abaadd() {
  document.body.appendChild(additem);
  tempo.setAttribute("disabled", "true");
}

function fecharadd() {
  if (additem && additem.parentNode) {
    document.body.removeChild(additem);
  }
}

function verificarcaixa() {
  if (texto.value.trim() !== "" && data.value !== "") {
    if (permitirHorario.checked && !tempo.value) {
      alert("Verifique sua resposta e tente novamente!");
      return;
    }

    const novoId = Date.now().toString();

    lista[novoId] = {
      id: novoId,
      texto: texto.value,
      data: data.value,
    };

    if (permitirHorario.checked) {
      lista[novoId].horario = tempo.value;
    }

    localStorage.setItem("lista", JSON.stringify(lista));
    adicionaritens();
    fecharadd();

    texto.value = "";
    tempo.value = "";
    data.value = "";
    permitirHorario.checked = false;
  } else {
    alert("Verifique sua resposta e tente novamente!");
  }
}

// Renderização otimizada com DocumentFragment
function renderizarLista(itensParaExibir) {
  lista_itens.innerText = "";

  // Fragmento em memória para otimizar o DOM
  const fragmento = document.createDocumentFragment();
  const agora = new Date();

  itensParaExibir.forEach((itemData) => {
    const item = document.createElement("div");
    const texto_item = document.createElement("h3");
    const tempo_item = document.createElement("p");
    const data_item = document.createElement("p");
    const horario = document.createElement("p");
    const deletarInput = document.createElement("input");

    // Verifica se a tarefa está atrasada
    const dataObjeto = new Date(
      `${itemData.data}T${itemData.horario || "23:59:59"}`,
    );
    const estaAtrasada = dataObjeto < agora;

    item.className = estaAtrasada ? "tarefa atrasada" : "tarefa";
    item.id = itemData.id;

    tempo_item.className = "tempo";
    texto_item.className = "texto";
    texto_item.innerText = itemData.texto;

    data_item.className = "data";
    data_item.innerText = itemData.data;

    deletarInput.id = "del" + itemData.id;
    deletarInput.className = "deletar";
    deletarInput.type = "checkbox";

    if (selecionado.includes(deletarInput.id)) {
      deletarInput.checked = true;
    }

    deletarInput.addEventListener("click", selecionar);

    tempo_item.appendChild(data_item);
    if (itemData.horario) {
      horario.className = "horario";
      horario.innerText = itemData.horario;
      tempo_item.appendChild(horario);
    }

    item.appendChild(deletarInput);
    item.appendChild(tempo_item);
    item.appendChild(texto_item);

    // Adiciona ao fragmento em vez do DOM diretamente
    fragmento.appendChild(item);
  });

  // Insere todos os itens de uma só vez na tela
  lista_itens.appendChild(fragmento);
}

function adicionaritens() {
  const chaves = Object.keys(lista);
  if (chaves.length === 0) {
    lista_itens.innerText = "";
    return;
  }

  let arrayItens = chaves.map((chave) => ({
    id: chave,
    ...lista[chave],
  }));

  const agora = new Date();

  // Ordena considerando data e horário exato
  arrayItens.sort((a, b) => {
    // Se não tiver horário, define 00:00 como padrão
    const horaA = a.horario ? a.horario : "00:00";
    const horaB = b.horario ? b.horario : "00:00";

    // Cria os objetos Date completos (YYYY-MM-DDTHH:mm)
    const dataHoraA = new Date(`${a.data}T${horaA}`);
    const dataHoraB = new Date(`${b.data}T${horaB}`);

    // Calcula a diferença absoluta em relação ao momento exato de agora
    const diffA = Math.abs(dataHoraA - agora);
    const diffB = Math.abs(dataHoraB - agora);

    return diffA - diffB;
  });

  renderizarLista(arrayItens);
}

function pesquisar(termo) {
  const chaves = Object.keys(lista);
  const itensFiltrados = chaves
    .map((chave) => ({ id: chave, ...lista[chave] }))
    .filter((item) => item.texto.toLowerCase().includes(termo));

  renderizarLista(itensFiltrados);
}

function selecionar() {
  if (this.checked) {
    if (!selecionado.includes(this.id)) {
      selecionado.push(this.id);
    }
  } else {
    selecionado = selecionado.filter((id) => id !== this.id);
  }

  menu_del.style.display = selecionado.length > 0 ? "block" : "none";
}

function deletar() {
  selecionado.forEach((delId) => {
    const chaveOriginal = delId.replace("del", "");
    delete lista[chaveOriginal];
  });

  selecionado = [];
  menu_del.style.display = "none";
  localStorage.setItem("lista", JSON.stringify(lista));
  adicionaritens();
}

adicionaritens();
