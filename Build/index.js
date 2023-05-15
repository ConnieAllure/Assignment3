const PAGE_SIZE = 10;
let currentPage = 1;
let pokemons = [];
let numTypes = [];

const updatePaginationDiv = (currentPage, numPages) => {
  $("#pagination").empty();

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(currentPage + 2, numPages);

  if (endPage - startPage < 4) {
    if (startPage == 1) {
      endPage = Math.min(numPages, 5);
    } else {
      startPage = Math.max(1, numPages - 4);
    }
  }

  if (startPage > 1) {
    $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="1">First</button>
      `);
    $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${
          startPage - 1
        }">Previous</button>
      `);
  }

  for (let i = startPage; i <= endPage; i++) {
    $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons${
          i == currentPage ? " active" : ""
        }" value="${i}">${i}</button>
      `);
  }

  if (endPage < numPages) {
    $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${
          endPage + 1
        }">Next</button>
      `);
    $("#pagination").append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${numPages}">Last</button>
      `);
  }

  // add a dropdown menu to select page
  $("#pagination").append(`
  <div class="dropdown ml-3">
    <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      Go to Page
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      ${Array.from({ length: numPages }, (_, i) => i + 1)
        .map(
          (page) => `
          <button class="dropdown-item page numberedButtons" value="${page}">${page}</button>
        `
        )
        .join("")}
    </div>
  </div>
`);
  // handle page selection from dropdown menu
  $(".dropdown-item.page").on("click", function () {
    const page = parseInt($(this).val());
    updatePaginationDiv(page, numPages);
    // trigger a custom event to notify the page change
    $("#pagination").trigger("pageChange", page);
  });
};

$("body").on("click", ".numberedButtons", async function (e) {
  currentPage = Number(e.target.value);
  paginate(currentPage, PAGE_SIZE, pokemons);

  //update pagination buttons
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);
});

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );


  $("#Displaylist").empty();
  const numPokemon = pokemons.length;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, numPokemon);
  $("#Displaylist").append(`
      <div class="Display">
        <h1>Displaying ${
          endIndex - startIndex
        } Pokemon out of ${numPokemon}</h1>
      </div>  
    `);

  selectedTypes = [];



  $("#pokeCards").empty();
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url);
    console.log(res.data);
    $("#pokeCards").append(`
        <div class="pokeCard card" pokeName=${res.data.name}   >
          <h3>${res.data.name.toUpperCase()}</h3> 
          <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
          <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
            More
          </button>
        </div>  
      `);
  });
};

const setup = async () => {
  // test out poke api using axios here

  $("#pokeCards").empty();
  const response = await axios.get(
    "https://pokeapi.co/api/v2/pokemon?offset=0&limit=810"
  );
  pokemons = response.data.results;

  paginate(currentPage, PAGE_SIZE, pokemons);
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
  updatePaginationDiv(currentPage, numPages);

  const resp = await axios.get(`https://pokeapi.co/api/v2/type/`);
  numTypes = resp.data.results;

  $("#pokeTypesFilter").empty();
  numTypes.forEach(async (pokemon) => {
    const resp = await axios.get(pokemon.url);
    const pokemonData = resp.data;
    console.log(pokemon.url);
    $("#pokeTypesFilter").append(`
        <input id="${pokemonData.name}" class="typeFilter" type="checkbox" name="type" value="${pokemon.url}"
        <label htmlfor="${pokemonData.name}" for="${pokemonData.name}"> ${pokemonData.name} </label>
      `);
  });

  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $("body").on("click", ".pokeCard", async function (e) {
    const pokemonName = $(this).attr("pokeName");
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name);
    // console.log("types: ", types);
    $(".modal-body").html(`
        <div style="width:200px">
        <img src="${
          res.data.sprites.other["official-artwork"].front_default
        }" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities
          .map((ability) => `<li>${ability.ability.name}</li>`)
          .join("")}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats
          .map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`)
          .join("")}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join("")}
          </ul>
      
        `);
    $(".modal-title").html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `);
  });

  $("body").on("change", ".typeFilter", async function () {
    $(".typeFilter:checked").each(function () {
      selectedTypes.push($(this).val());
    });

    type1 = selectedTypes[0];
    type2 = selectedTypes[1];

    if(selectedTypes.length == 1){
      res = await axios.get(type1);
      filteredPokemon = res.data.pokemon.map((item)=>{return item.pokemon;});
      console.log(filteredPokemon);
    } else if(selectedTypes.length == 2){
      res = await axios.get(type1);
      res1 = await axios.get(type2);

      const pokemonOfType1 = res.data.pokemon.map((item) => item.pokemon);
      const pokemonOfType2 = res1.data.pokemon.map((item) => item.pokemon);

      filteredPokemon = pokemonOfType1.filter(item => pokemonOfType2.includes(item));

      console.log(pokemonOfType1);
      console.log(pokemonOfType2);
      console.log(filteredPokemon);
    } 

    console.log(type1);
    console.log(type2);

    paginate(1, PAGE_SIZE, filteredPokemon);
    updatePaginationDiv(1, numPages);
  });

  // add event listener to pagination buttons
  $("body").on("click", ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value);
    paginate(currentPage, PAGE_SIZE, pokemons);

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages);
  });
};

$(document).ready(setup);
