// Seleciona o campo de texto onde o usuário digita a pesquisa
const inputElement = document.querySelector("#search-input");

// Seleciona o ícone de "fechar" (aquele X que limpa o texto da pesquisa)
const search_icon = document.querySelector("#search-close-icon");

// Seleciona a área que envolve o botão/ícone de filtros
const gen_wrapper = document.querySelector(".gen-wrapper");

// Aqui estamos dizendo: "quando o usuário digitar algo nesse campo (inputElement),
// execute a função que está entre { ... }".
inputElement.addEventListener("input", () => {

  // Dentro dessa função, chamamos 'handleInputChange',
  // passando o próprio campo de texto como argumento.
  // Essa função é quem vai decidir o que fazer com o texto digitado
  // (por exemplo: filtrar uma lista de Pokémon, mostrar sugestões, etc.).
  handleInputChange(inputElement);
});


// Adiciona um "ouvinte" que detecta quando o usuário clica no ícone de fechar
search_icon.addEventListener("click", handleSearchCloseOnClick);

// Adiciona um "ouvinte" que detecta quando o usuário clica no ícone de filtros
gen_wrapper.addEventListener("click", handleGenIconOnClick);

// Função que decide o que acontece quando o usuário digita algo no campo de pesquisa
function handleInputChange(inputElement) {

  // Pega o texto que o usuário digitou dentro do campo
  const inputValue = inputElement.value;

  // Se o campo NÃO estiver vazio (ou seja, se o usuário digitou alguma coisa)...
  if (inputValue !== "") {

    // ...mostra o ícone de "fechar pesquisa" (um X, por exemplo).
    // Isso é feito adicionando uma classe CSS que deixa o ícone visível.
    document
      .querySelector("#search-close-icon")
      .classList.add("search-close-icon-visible");
  } else {

    // Se o campo estiver vazio (sem nada digitado)...
    // ...esconde o ícone de "fechar pesquisa".
    // Isso é feito removendo a classe CSS que o deixava visível.
    document
      .querySelector("#search-close-icon")
      .classList.remove("search-close-icon-visible");
  }
}

// Função que define o que acontece quando o usuário clica no ícone de "fechar pesquisa"
function handleSearchCloseOnClick() {

  // Procura o campo de pesquisa na página (aquele onde o usuário digita)
  // e apaga todo o texto que estava escrito nele.
  document.querySelector("#search-input").value = "";

  // Procura o ícone de "fechar pesquisa" (normalmente um X)
  // e remove a classe CSS que o deixava visível.
  // Assim, o ícone desaparece da tela.
  document.querySelector("#search-close-icon")
    .classList.remove("search-close-icon-visible");
}

// Função que define o que acontece quando o usuário clica no ícone de "geração" (gen icon)
function handleGenIconOnClick() {

  // Procura na página o elemento que contém os filtros de geração de Pokémon
  // (provavelmente uma caixa com botões ou opções).
  // Depois, alterna (liga/desliga) a classe "filter-wrapper-open".
  // → Se a classe não estiver aplicada, ela é adicionada (abrindo o filtro).
  // → Se já estiver aplicada, ela é removida (fechando o filtro).
  document.querySelector(".gen-filter-wrapper").classList.toggle("filter-wrapper-open");

  // Procura o elemento <body> da página inteira.
  // Alterna a classe "filter-wrapper-overlay".
  // Essa classe provavelmente adiciona um fundo escuro ou bloqueia a interação
  // com o resto da página enquanto o filtro está aberto.
  document.querySelector("body").classList.toggle("filter-wrapper-overlay");

  // Procura na página o elemento que tem o id "gen-icon"
  document.getElementById("gen-icon")

    // Alterna a classe "toggle-active" nesse elemento:
    // - Se o elemento NÃO tiver a classe → adiciona
    // - Se o elemento JÁ tiver a classe → remove
    .classList.toggle("toggle-active");

}

// Procura todos os elementos <input> dentro de ".filter-wrap"
// (são os botões de rádio das gerações).
const generationInputs = document.querySelectorAll(".filter-wrap input");

// Para cada input encontrado...
generationInputs.forEach(input => {

  // Adiciona um "ouvinte" que detecta quando esse input é clicado.
  input.addEventListener("click", () => {

    // Primeiro, remove a classe "toggle-active" de todos os labels.
    // Isso garante que nenhum outro continue marcado como ativo.
    generationInputs.forEach(i => {
      const label = document.querySelector(`label[for="${i.id}"]`);
      label.classList.remove("toggle-active");
    });

    // Depois, adiciona a classe "toggle-active" apenas ao label
    // correspondente ao input que foi clicado.
    const clickedLabel = document.querySelector(`label[for="${input.id}"]`);
    clickedLabel.classList.add("toggle-active");
  });
});

