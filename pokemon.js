// Declaração de variavéis principais que recebem os elementos HTML
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];
let pokemonCache = {};


function getGenerationRange(genId) {
  switch (genId) {
    case "1": return { firstPokemon: 0, lastPokemon: 151 };    // Kanto
    case "2": return { firstPokemon: 151, lastPokemon: 100 };  // Johto
    case "3": return { firstPokemon: 251, lastPokemon: 135 };  // Hoenn
    case "4": return { firstPokemon: 386, lastPokemon: 107 };  // Sinnoh
    case "5": return { firstPokemon: 493, lastPokemon: 156 };  // Unova
    case "6": return { firstPokemon: 649, lastPokemon: 72 };   // Kalos
    case "7": return { firstPokemon: 721, lastPokemon: 88 };   // Alola
    case "8": return { firstPokemon: 809, lastPokemon: 96 };   // Galar
    case "9": return { firstPokemon: 905, lastPokemon: 120 };  // Paldea
    default: return { firstPokemon: 0, lastPokemon: 151 };     // fallback
  }
}

// Função que carrega os Pokémons de uma geração específica
function loadGeneration(genId) {
  // Pegamos o primeiro e o último Pokémon dessa geração
  // (a função getGenerationRange devolve esses valores)
  const { firstPokemon, lastPokemon } = getGenerationRange(genId);

  // Fazemos uma busca na API oficial de Pokémons (PokeAPI)
  // Usamos "offset" para dizer onde começar e "limit" para dizer quantos trazer
  fetch(`https://pokeapi.co/api/v2/pokemon?offset=${firstPokemon}&limit=${lastPokemon}`)
    // Quando a resposta chega, transformamos em formato JSON (mais fácil de usar)
    .then((response) => response.json())
    // Depois pegamos os dados e guardamos na variável "allPokemons"
    .then((data) => {
      allPokemons = data.results;
      // Chamamos a função que cria os cards dos Pokémons na tela
      createCardPokemons(allPokemons);
    })
    // Se der algum erro na busca, mostramos no console
    .catch((error) => console.error("Erro ao buscar Pokémons:", error));
}

// Procuramos todos os botões de seleção (radio buttons) que têm o nome "generation"
document.querySelectorAll('input[name="generation"]').forEach((radio) => {
  // Para cada botão, adicionamos um evento que dispara quando o usuário troca a seleção
  radio.addEventListener("change", (event) => {
    // Pegamos o valor da geração escolhida (ex: 1, 2, 3...)
    const genId = event.target.value;
    // Carregamos os Pokémons dessa geração
    loadGeneration(genId);
  });
});

// Quando a página terminar de carregar (DOMContentLoaded),
// definimos qual geração deve aparecer primeiro
window.addEventListener("DOMContentLoaded", () => {
  // Pegamos o botão de geração que já está marcado por padrão
  const defaultGen = document.querySelector('input[name="generation"]:checked').value;
  // Carregamos os Pokémons dessa geração inicial
  loadGeneration(defaultGen);
});

// Função para buscar os dados completos de um Pokémon, usando cache (memória temporária)
async function getPokemonData(url) {
  // Primeiro verificamos se já temos os dados guardados no cache para esse endereço (url)
  // Se já estiver guardado, devolvemos direto sem precisar buscar de novo na internet
  if (pokemonCache[url]) return pokemonCache[url];

  // Se não estiver no cache, fazemos uma busca na internet (API) usando o endereço (url)
  const response = await fetch(url);

  // Transformamos a resposta em formato JSON (um jeito organizado de guardar dados)
  const data = await response.json();

  // Guardamos os dados no cache, para não precisar buscar de novo no futuro
  pokemonCache[url] = data;

  // Por fim, devolvemos os dados para quem chamou a função
  return data;
}

// Função assíncrona (async) que busca os dados de um Pokémon antes de redirecionar
async function fetchPokemonDataBeforeRedirect(id) {
  try {
    // Usamos Promise.all para fazer duas buscas ao mesmo tempo:
    // 1. Dados principais do Pokémon (status, habilidades, etc.)
    // 2. Dados da espécie (descrição, cor, evolução, etc.)
    const [pokemon, pokemonSpecies] = await Promise.all([
      // Faz a primeira busca na API de Pokémon usando o ID
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) => res.json()),
      // Faz a segunda busca na API de espécies usando o mesmo ID
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) => res.json()),
    ]);

    // Se tudo deu certo, devolvemos um objeto com os dois resultados
    return { pokemon, pokemonSpecies };
  } catch (error) {
    // Se acontecer algum erro durante a busca, mostramos no console
    console.error("Failed to fetch Pokemon data before redirect", error);
    // E devolvemos "null" para indicar que não conseguimos pegar os dados
    return null;
  }
}

// Cores dos Tipos (Obs: Sim querida eu sei que são outras cores, mas depois eu ou você pode alterar 😁)
const typeColors = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  normal: "#A8A878"
};

// Função assíncrona que cria os cards dos Pokémons na tela
async function createCardPokemons(pokemonList) {
  // Primeiro limpamos a área onde os cards vão aparecer
  listWrapper.innerHTML = "";

  // Para cada Pokémon da lista recebida
  for (const pokemon of pokemonList) {
    // Pegamos o ID do Pokémon a partir da URL (o número está na posição 6 da URL)
    const pokemonID = pokemon.url.split("/")[6];

    // Buscamos os dados completos do Pokémon, usando cache para não repetir buscas
    const data = await getPokemonData(pokemon.url);

    // Pegamos os tipos do Pokémon (ex: fogo, água, planta...)
    const types = data.types.map(type => type.type.name);

    // Criamos uma div que será o card do Pokémon
    const listItem = document.createElement('div');
    listItem.className = "list-item";

    // Variável que vai guardar a cor de fundo dos textos
    let statColor = "";

    // Se o Pokémon tiver apenas 1 tipo
    if (types.length === 1) {
      // A cor de fundo do card será a cor correspondente ao tipo
      listItem.style.backgroundColor = typeColors[types[0]] || "#fff";
      statColor = `background-color:${typeColors[types[0]]};`;
    }
    // Se o Pokémon tiver 2 tipos
    else {
      // Pegamos as duas cores correspondentes
      const color1 = typeColors[types[0]] || "#fff";
      const color2 = typeColors[types[1]] || "#fff";
      // Criamos um fundo com gradiente (mistura das duas cores)
      listItem.style.backgroundImage = `linear-gradient(135deg, ${color1}, ${color2})`;
      statColor = `background-image: linear-gradient(135deg, ${color1}, ${color2});`;
    }

    // Texto que mostra os tipos (ex: "fogo / voador")
    const typeText = types.join(" / ");
    // Pegamos o valor de ataque do Pokémon
    const statAttack = data.stats[1].base_stat;
    // Pegamos o valor de defesa do Pokémon
    const statDefense = data.stats[2].base_stat;

    // Função que renderiza (desenha) o card do Pokémon
    function renderPokemon() {
      // Verifica se o usuário escolheu ver sprites "normal" ou "shiny"
      const type = document.querySelector('input[name="type"]:checked').value;

      // Define qual imagem do Pokémon será usada (normal ou shiny)
      // Aqui estamos criando uma variável chamada "spriteType"
      // Ela vai guardar o endereço (URL) da imagem do Pokémon
      const spriteType = type === "normal"
        // Se a opção escolhida for "normal", usamos a imagem padrão do Pokémon
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonID}.png`
        // Caso contrário (se não for "normal"), usamos a imagem "shiny" (brilhante)
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemonID}.png`;


      // Monta o HTML do card com nome, ID, imagem e estatísticas
      listItem.innerHTML = `
        <div class="identified-wrap" style="color: white; font-weight: 900;">
          <p class="body3-fonts">${pokemon.name.toUpperCase()}</p>
          <p class="caption-fonts">#${pokemonID}</p>
          <img src="pokeball.svg" alt="pokeball" style="height: 15vh;">
        </div>
        <div class="img-wrap">
          <img src="${spriteType}" alt="${pokemon.name}" />
        </div>
        <div class="stats-wrap">
          <p class="body3-fonts" style="${statColor}">${typeText}</p>
          <p class="body3-fonts" style="${statColor}">ATK | ${statAttack}</p>
          <p class="body3-fonts" style="${statColor}">DEF | ${statDefense}</p>
        </div>
      `;
    }

    // Adiciona evento nos botões de escolha (normal/shiny)
    document.querySelectorAll('input[name="type"]').forEach(input => {
      input.addEventListener("click", renderPokemon);
    });

    // Renderiza o card pela primeira vez (mostrando o sprite normal)
    renderPokemon();

    // Quando o usuário clicar no card, busca os dados completos e redireciona para a página de detalhes
    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDataBeforeRedirect(pokemonID);
      if (success) {
        window.location.href = `./details.html?id=${pokemonID}`;
      }
    });

    // Adiciona o card na tela
    listWrapper.appendChild(listItem);
  }
}

// Quando alguém digitar algo no campo de busca (cada vez que solta uma tecla),
// chamamos a função "handleSearch" para verificar o que foi escrito
searchInput.addEventListener("keyup", handleSearch);

// Esta é a função que vai cuidar da busca
function handleSearch() {
  // Pegamos o texto digitado no campo de busca e transformamos em letras minúsculas
  // Isso evita problemas de comparação entre maiúsculas e minúsculas
  const searchTerm = searchInput.value.toLowerCase();

  // Criamos uma variável que vai guardar os pokémons filtrados
  let filteredPokemons;

  // Se o filtro por número estiver marcado (checkbox selecionado)
  if (numberFilter.checked) {
    // Filtramos a lista de todos os pokémons
    filteredPokemons = allPokemons.filter((pokemon) => {
      // Pegamos o número do pokémon a partir da URL (o ID está na posição 6 da URL)
      const pokemonID = pokemon.url.split("/")[6];
      // Verificamos se esse número começa com o que foi digitado
      return pokemonID.startsWith(searchTerm);
    });
    // Se o filtro por nome estiver marcado
  } else if (nameFilter.checked) {
    // Filtramos a lista de todos os pokémons
    filteredPokemons = allPokemons.filter((pokemon) =>
      // Verificamos se o nome do pokémon começa com o que foi digitado
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
    // Se nenhum filtro estiver marcado
  } else {
    // Mostramos todos os pokémons sem filtrar
    filteredPokemons = allPokemons;
  }

  // Atualizamos a tela mostrando apenas os pokémons filtrados
  createCardPokemons(filteredPokemons);

  // Se não foi encontrado nenhum pokémon
  if (filteredPokemons.length === 0) {
    // Mostramos a mensagem "não encontrado"
    notFoundMessage.style.display = "block";
  } else {
    // Caso contrário, escondemos a mensagem
    notFoundMessage.style.display = "none";
  }
}

// Aqui estamos procurando na página um botão com a classe "search-close-icon"
// Esse botão é o "X" que serve para limpar a busca
const closeButton = document.querySelector(".search-close-icon");

// Dizemos que quando alguém clicar nesse botão, vai acontecer a função chamada "clearSearch"
closeButton.addEventListener("click", clearSearch);

// Esta é a função "clearSearch" (em português: limpar busca)
// Ela define o que vai acontecer quando o botão for clicado
function clearSearch() {
  // Primeiro, o campo de busca (onde a pessoa digita) é apagado, fica vazio
  searchInput.value = "";

  // Depois, chamamos a função que mostra todos os pokémons de novo
  // Ou seja, a lista volta ao estado inicial, sem filtro
  createCardPokemons(allPokemons);

  // Por fim, escondemos a mensagem de "não encontrado"
  // Isso garante que a tela fique limpa e sem aviso de erro
  notFoundMessage.style.display = "none";
}

/* -------------------------------------------------------- Another Sprites -------------------------------------------------------- 

<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/heartgold-soulsilver/shiny/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-iv/diamond-pearl/shiny/${pokemonID}.png" alt="${pokemon.name}" />
 
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemonID}.png" alt="${pokemon.name}" />
<img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemon.name}" />
 
*/