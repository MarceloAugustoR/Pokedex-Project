// Cria uma variável que vai guardar o ID do Pokémon atual.
// "null" significa que, por enquanto, não há nenhum Pokémon selecionado.
let currentPokemonId = null;

// Diz ao navegador: "Espere toda a página (HTML) estar pronta
// para então executar a função que vem a seguir."
document.addEventListener("DOMContentLoaded", () => {

    // Define o número máximo de Pokémons aceitos pelo site.
    // Isso evita que alguém tente acessar um Pokémon que não existe.
    const MAX_POKEMONS = 1025;

    // Pega a parte da URL que contém os parâmetros (o que vem depois de "?").
    // Exemplo: em "pagina.html?id=25", o parâmetro "id" vale "25".
    const pokemonID = new URLSearchParams(window.location.search).get("id");

    // Converte o texto do parâmetro "id" para número inteiro.
    // O "10" indica que o número está na base decimal (normal).
    const id = parseInt(pokemonID, 10);

    // Verifica se o ID é menor que 1 ou maior que o máximo permitido.
    // Se for inválido, redireciona o usuário de volta para a página inicial.
    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = "./index.html");
    }

    // Guarda o ID válido na variável global, para outras partes do código usarem depois.
    currentPokemonId = id;

    // Chama uma função (que você deve ter criado em outro arquivo ou acima)
    // para carregar as informações do Pokémon com esse ID.
    loadPokemon(id);
});

// Define uma função que trabalha de forma "assíncrona" (pode esperar respostas da internet)
// para carregar as informações de um Pokémon, dado seu ID (número).
async function loadPokemon(id) {
    try {
        // Faz duas buscas ao mesmo tempo (Promise.all):
        // 1) Dados gerais do Pokémon (nome, altura, habilidades, etc.)
        // 2) Dados da espécie (textos descritivos, idioma, curiosidades)
        const [pokemon, pokemonSpecies] = await Promise.all([
            // Busca os dados gerais do Pokémon no site da PokéAPI.
            // "fetch" pede os dados e ".then(res => res.json())" transforma a resposta em objeto JavaScript.
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
                res.json()
            ),
            // Busca os dados da espécie do mesmo Pokémon.
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then((res) =>
                res.json()
            ),
        ]);

        // Procura na página a área onde as habilidades/movimentos do Pokémon vão aparecer.
        const abilitiesWrapper = document.querySelector(
            ".pokemon-detail-wrap .pokemon-detail.move"
        );
        // Limpa o conteúdo anterior dessa área, para não ficar com informações duplicadas.
        abilitiesWrapper.innerHTML = "";

        // Confere se o Pokémon que estamos carregando é de fato o "atual" (evita desenhar dados errados).
        if (currentPokemonId === id) {
            // Mostra os detalhes do Pokémon na tela (função criada em outro lugar do código).
            displayPokemonDetails(pokemon);

            // Pega um texto descritivo (em inglês) da espécie do Pokémon.
            const flavorText = getEnglishFlavorText(pokemonSpecies);

            // Coloca esse texto descritivo na área correta da página.
            document.querySelector(".body3-fonts.pokemon-description").textContent =
                flavorText;

            // Seleciona as setas de navegação (esquerda e direita) na tela.
            const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map((sel) =>
                document.querySelector(sel)
            );

            // Remove escutas de clique antigas, para evitar que o mesmo clique dispare várias vezes.
            leftArrow.removeEventListener("click", navigatePokemon);
            rightArrow.removeEventListener("click", navigatePokemon);

            // Se não for o primeiro Pokémon (id 1), permite ir para o anterior ao clicar na seta esquerda.
            if (id !== 1) {
                leftArrow.addEventListener("click", () => {
                    navigatePokemon(id - 1);
                });
            }

            // Se não for o último da faixa definida (aqui, 151), permite ir para o próximo ao clicar na seta direita.
            if (id !== 151) {
                rightArrow.addEventListener("click", () => {
                    navigatePokemon(id + 1);
                });
            }

            // Atualiza a URL do navegador para refletir o Pokémon atual,
            // sem recarregar a página (mantém a navegação suave).
            window.history.pushState({}, "", `./details.html?id=${id}`);
        }

        // Diz que deu tudo certo ao carregar os dados.
        return true;
    } catch (error) {
        // Se algo der errado (por exemplo, internet caiu ou a API não respondeu),
        // mostra o erro no console para ajudar a identificar o problema.
        console.error("An error occured while fetching Pokemon data:", error);
        // Diz que deu errado ao carregar os dados.
        return false;
    }
}

// Define uma função chamada "navigatePokemon" que recebe um número (id) como parâmetro.
// Esse "id" representa o identificador de um Pokémon específico.
async function navigatePokemon(id) {

    // Atualiza a variável "currentPokemonId" com o valor recebido.
    // Isso guarda qual Pokémon está sendo mostrado ou navegado no momento.
    currentPokemonId = id;

    // Chama a função "loadPokemon" passando o mesmo id.
    // O "await" significa que o JavaScript vai esperar essa função terminar
    // (porque ela provavelmente busca dados de um servidor ou arquivo).
    // Só depois de terminar é que o código continua.
    await loadPokemon(id);
}

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

// Função chamada "setElementStyles" que serve para aplicar um estilo (CSS) em vários elementos de uma vez
function setElementStyles(elements, cssProperty, value) {

    // "elements" é uma lista de elementos da página (por exemplo, vários <div>, <p>, <img> etc.)
    // "cssProperty" é o nome da propriedade de estilo que queremos mudar (ex: "backgroundColor", "color", "fontSize")
    // "value" é o valor que queremos aplicar nessa propriedade (ex: "red", "20px", "#333")

    // Para cada elemento dentro da lista "elements"...
    elements.forEach((element) => {

        // ...aplica o estilo escolhido.
        // Exemplo: element.style["color"] = "red";
        // Isso muda a cor do texto do elemento para vermelho.
        element.style[cssProperty] = value;
    });
}

// Função chamada "rgbaFromHex" que transforma uma cor em formato HEX (#RRGGBB)
// em uma sequência de números separados por vírgula (R, G, B).
function rgbaFromHex(hexColor) {

    // Retorna um array com três valores:
    // 1. O valor do vermelho (R)
    // 2. O valor do verde (G)
    // 3. O valor do azul (B)
    // Depois junta tudo em uma string separada por vírgulas.
    return [
        // Pega os dois primeiros dígitos depois do "#" (posição 1 até 3)
        // e converte de hexadecimal para número decimal.
        parseInt(hexColor.slice(1, 3), 16),

        // Pega os dois dígitos seguintes (posição 3 até 5)
        // e converte de hexadecimal para número decimal.
        parseInt(hexColor.slice(3, 5), 16),

        // Pega os dois últimos dígitos (posição 5 até 7)
        // e converte de hexadecimal para número decimal.
        parseInt(hexColor.slice(5, 7), 16),
    ].join(", "); // Junta os três números em uma string: "R, G, B"
}

// Função que muda as cores de fundo da área de detalhes do Pokémon,
// de acordo com o(s) tipo(s) dele (ex: fogo, água, planta).
function setTypeBackgroundColor(data) {
    // Pega todos os tipos do Pokémon (alguns têm 1 tipo, outros têm 2).
    // Exemplo: Charizard → ["fire", "flying"].
    const types = data.types.map(type => type.type.name);

    // Pega o primeiro tipo da lista (o "principal").
    const mainType = data.types[0].type.name;

    // Busca a cor correspondente a esse tipo principal dentro de um objeto chamado "typeColors".
    // Esse objeto deve ter algo como { fire: "#F08030", water: "#6890F0", ... }.
    const color = typeColors[mainType];

    // Procura na página o elemento que mostra os detalhes principais do Pokémon.
    const mainColor = document.querySelector(".detail-main");

    // Antes de aplicar novas cores, limpa qualquer estilo anterior.
    mainColor.style.backgroundImage = "";
    mainColor.style.backgroundColor = "";

    // Se o Pokémon tiver apenas um tipo...
    if (types.length === 1) {
        // ...aplica uma cor sólida de fundo.
        // Se não encontrar a cor, usa branco ("#fff") como padrão.
        mainColor.style.backgroundColor = typeColors[types[0]] || "#fff";
    } else {
        // Se o Pokémon tiver dois tipos...
        // ...cria um gradiente (mistura de duas cores).
        const color1 = typeColors[types[0]] || "#fff";
        const color2 = typeColors[types[1]] || "#fff";
        mainColor.style.backgroundImage = `linear-gradient(135deg, ${color1}, ${color2})`;
    }

    // Se não existir cor definida para o tipo principal, mostra um aviso no console.
    if (!color) {
        console.warn(`Color not defined for type: ${mainType}`);
        return; // Sai da função sem aplicar nada.
    }

    // Aplica a cor em outros elementos da página para manter o estilo consistente.
    // Exemplo: bordas, fundo de textos, barras de progresso.
    setElementStyles([mainColor], "borderColor", color);
    setElementStyles(document.querySelectorAll(".power-wrapper > p"), "backgroundColor", color);
    setElementStyles(document.querySelectorAll(".stats-wrap p.stats"), "color", color);
    setElementStyles(document.querySelectorAll(".stats-wrap .progress-bar"), "color", color);

    // Converte a cor em formato hexadecimal (#RRGGBB) para RGBA (que permite transparência).
    const rgbaColor = rgbaFromHex(color);

    // Cria uma nova tag <style> para adicionar regras de CSS diretamente no documento.
    const styleTag = document.createElement("style");

    // Dentro dessa tag, define estilos especiais para as barras de progresso,
    // usando a cor do tipo do Pokémon.
    styleTag.innerHTML = `
    .stats-wrap .progress-bar::-webkit-progress-bar {
        background-color: rgba(${rgbaColor}, 0.5); /* fundo da barra com transparência */
    }
    .stats-wrap .progress-bar::-webkit-progress-value {
        background-color: ${color}; /* parte preenchida da barra */
    }
  `;

    // Adiciona essa nova tag <style> dentro do <head> da página,
    // fazendo com que os estilos passem a valer imediatamente.
    document.head.appendChild(styleTag);
}

// Função que coloca a primeira letra em maiúscula e o resto em minúscula
function capitalizeFirstLetter(string) {
    // Pega o primeiro caractere da palavra (posição 0) e transforma em maiúscula
    return string.charAt(0).toUpperCase()
        // Depois pega o restante da palavra (do segundo caractere em diante)
        // e transforma tudo em minúsculo
        + string.slice(1).toLowerCase();
}

// Função que cria um elemento HTML e adiciona dentro de outro elemento (pai)
function createAndAppendElement(parent, tag, options = {}) {
    // Cria um novo elemento HTML com a tag informada (ex: "div", "p", "img")
    const element = document.createElement(tag);

    // Percorre todas as propriedades enviadas em "options"
    // e aplica essas propriedades no elemento criado
    Object.keys(options).forEach((key) => {
        element[key] = options[key];
    });

    // Adiciona o elemento criado dentro do elemento pai
    parent.appendChild(element);

    // Retorna o elemento criado (caso queira usar depois)
    return element;
}

// Função que mostra os detalhes de um Pokémon na tela
function displayPokemonDetails(pokemon) {

    // Pega informações importantes do Pokémon (nome, id, tipos, peso, altura, habilidades, estatísticas)
    const { name, id, types, weight, height, abilities, stats } = pokemon;

    // Coloca a primeira letra do nome em maiúscula (ex: "pikachu" → "Pikachu")
    const capitalizePokemonName = capitalizeFirstLetter(name);

    // Muda o título da aba do navegador para o nome do Pokémon
    document.querySelector("title").textContent = capitalizePokemonName;


    // Procura na página o elemento principal que mostra os detalhes do Pokémon
    const detailMainElement = document.querySelector(".detail-main");

    // Adiciona uma classe com o nome do Pokémon (em letras minúsculas).
    // Isso permite que o CSS aplique estilos diferentes para cada Pokémon.
    detailMainElement.classList.add(name.toLowerCase());

    // Procura o elemento que deve mostrar o nome do Pokémon na área de estatísticas
    // e coloca o nome com a primeira letra maiúscula.
    document.querySelector(".stats-wrap .name").textContent =
        capitalizePokemonName;

    // Procura o elemento que mostra o número (ID) do Pokémon.
    // Usa padStart(3, "0") para garantir que o número tenha sempre 3 dígitos.
    // Exemplo: 1 → #001, 25 → #025.
    document.querySelector(
        ".pokemon-id-wrap .body2-fonts"
    ).textContent = `#${String(id).padStart(3, "0")}`;

    // Procura a imagem do Pokémon dentro da área de detalhes.
    const imageElement = document.querySelector(".detail-img-wrapper img");

    // Define o endereço da imagem do Pokémon.
    // Aqui está usando os sprites animados da PokéAPI (formato GIF).
    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;

    // Define o texto alternativo da imagem (alt).
    // Esse texto aparece se a imagem não carregar e também é usado por leitores de tela.
    imageElement.alt = name;

    // Procura na página o elemento que vai mostrar os tipos do Pokémon
    // (ex: fogo, água, planta). Esse elemento tem a classe "power-wrapper".
    const typeWrapper = document.querySelector(".power-wrapper");

    // Limpa qualquer conteúdo que já estava dentro dessa área,
    // para não misturar informações antigas com as novas.
    typeWrapper.innerHTML = "";

    // Para cada tipo que o Pokémon possui...
    types.forEach(({ type }) => {
        // Cria um novo parágrafo (<p>) e adiciona dentro da área de tipos.
        // Esse parágrafo mostra o nome do tipo (ex: "fire", "grass").
        // Também aplica classes CSS para estilizar o texto.
        createAndAppendElement(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`, // classes para estilo
            textContent: type.name,                     // texto exibido
        });
    });

    // Procura na página o elemento que mostra o peso do Pokémon
    // e coloca o valor convertido em quilogramas.
    // A API retorna o peso em decigramas, por isso divide por 10.
    document.querySelector(
        ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight"
    ).textContent = `${weight / 10}kg`;

    // Procura na página o elemento que mostra a altura do Pokémon
    // e coloca o valor convertido em metros.
    // A API retorna a altura em decímetros, por isso divide por 10.
    document.querySelector(
        ".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height"
    ).textContent = `${height / 10}m`;

    // Procura na página o elemento que vai mostrar as habilidades do Pokémon.
    // Esse elemento está dentro de ".pokemon-detail-wrap" e tem a classe ".pokemon-detail.move".
    const abilitiesWrapper = document.querySelector(
        ".pokemon-detail-wrap .pokemon-detail.move"
    );

    // Para cada habilidade que o Pokémon possui...
    abilities.forEach(({ ability }) => {

        // Cria um novo parágrafo (<p>) e adiciona dentro da área de habilidades.
        // Esse parágrafo vai mostrar o nome da habilidade (ex: "overgrow", "blaze").
        createAndAppendElement(abilitiesWrapper, "p", {
            className: "body3-fonts",   // aplica uma classe CSS para estilizar o texto
            textContent: ability.name,  // define o texto como o nome da habilidade
        });
    });

    // Procura na página o elemento que tem a classe "stats-wrapper".
    // Esse elemento é a área onde vamos mostrar as estatísticas do Pokémon.
    const statsWrapper = document.querySelector(".stats-wrapper");

    // Limpa todo o conteúdo que já estava dentro dessa área.
    // Assim, evita que informações antigas fiquem misturadas com as novas.
    statsWrapper.innerHTML = "";

    // Cria um "mapa" (um objeto) que traduz os nomes das estatísticas
    // vindas da API para abreviações mais amigáveis que vão aparecer na tela.
    const statNameMapping = {
        hp: "HP",                // Vida
        attack: "ATK",           // Ataque
        defense: "DEF",          // Defesa
        "special-attack": "SATK",// Ataque especial
        "special-defense": "SDEF",// Defesa especial
        speed: "SPD",            // Velocidade
    };

    // Para cada estatística do Pokémon (HP, ataque, defesa, etc.),
    // executa a função que cria elementos na tela.
    stats.forEach(({ stat, base_stat }) => {

        // Cria uma nova "caixa" (div) para agrupar os dados dessa estatística.
        const statDiv = document.createElement("div");
        statDiv.className = "stats-wrap"; // dá uma classe para estilizar via CSS
        statsWrapper.appendChild(statDiv); // adiciona essa caixa dentro da área de estatísticas

        // Cria um parágrafo (<p>) que mostra o nome da estatística (ex: HP, ATK).
        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts stats", // aplica estilos
            textContent: statNameMapping[stat.name], // pega o nome amigável da estatística
        });

        // Cria outro parágrafo (<p>) que mostra o valor da estatística.
        // Exemplo: se o valor for 45, aparece "045".
        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts",
            textContent: String(base_stat).padStart(3, "0"), // garante 3 dígitos
        });

        // Cria uma barra de progresso (<progress>) para visualizar o valor da estatística.
        // O valor vai de 0 até 100, mostrando o "nível" da estatística.
        createAndAppendElement(statDiv, "progress", {
            className: "progress-bar",
            value: base_stat, // valor real da estatística
            max: 100,         // limite máximo da barra
        });
    });

    // Por fim, chama a função que pinta o fundo da tela com a cor correspondente ao tipo do Pokémon
    setTypeBackgroundColor(pokemon);
}

// Função que pega o texto descritivo (flavor text) em inglês de um Pokémon
function getEnglishFlavorText(pokemonSpecies) {
    // Percorre todas as entradas de texto descritivo do Pokémon
    for (let entry of pokemonSpecies.flavor_text_entries) {
        // Verifica se a entrada está no idioma inglês
        if (entry.language.name === "en") {
            // Substitui caracteres especiais "\f" por espaço
            let flavor = entry.flavor_text.replace(/\f/g, " ");
            // Retorna o texto encontrado
            return flavor;
        }
    }
    // Se não encontrar nada em inglês, retorna vazio
    return "";
}

//------------------------------------------------------------ Another Sprites ------------------------------------------------------------//  
//imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
//imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
//imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
//imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
