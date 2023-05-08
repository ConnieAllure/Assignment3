const PAGE_SIZE = 10
let currentPage = 1;
let pokemons = []



const updatePaginationDiv = (currentPage, numPages) => {
    $('#pagination').empty()
  
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
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="1">First</button>
      `)
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${startPage - 1}">Previous</button>
      `)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons${i == currentPage ? ' active' : ''}" value="${i}">${i}</button>
      `)
    }
    
    if (endPage < numPages) {
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${endPage + 1}">Next</button>
      `)
      $('#pagination').append(`
        <button class="btn btn-primary page ml-1 numberedButtons" value="${numPages}">Last</button>
      `)
    }

      // add a dropdown menu to select page
  $('#pagination').append(`
  <div class="dropdown ml-3">
    <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
      Go to Page
    </button>
    <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
      ${Array.from({ length: numPages }, (_, i) => i + 1)
        .map((page) => `
          <button class="dropdown-item page numberedButtons" value="${page}">${page}</button>
        `)
        .join('')}
    </div>
  </div>
`)
      // handle page selection from dropdown menu
  $('.dropdown-item.page').on('click', function() {
    const page = parseInt($(this).val());
    updatePaginationDiv(page, numPages);
    // trigger a custom event to notify the page change
    $('#pagination').trigger('pageChange', page);
  });
  }

  const displayPokemonCount = (currentPage, PAGE_SIZE, numPokemon) => {
    const start = (currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(start + PAGE_SIZE - 1, numPokemon);
    $('#pokemonCount').html(`Displaying Pokemon ${start}-${end} out of ${numPokemon}`);
  };
  

  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)
  
    //update pagination buttons
    const numPages = Math.ceil(pokemons.length / PAGE_SIZE);
    updatePaginationDiv(currentPage, numPages)
  })

const paginate = async (currentPage, PAGE_SIZE, pokemons) => {
  selected_pokemons = pokemons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  $('#pokeCards').empty()
  selected_pokemons.forEach(async (pokemon) => {
    const res = await axios.get(pokemon.url)
    $('#pokeCards').append(`
      <div class="pokeCard card" pokeName=${res.data.name}   >
        <h3>${res.data.name.toUpperCase()}</h3> 
        <img src="${res.data.sprites.front_default}" alt="${res.data.name}"/>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#pokeModal">
          More
        </button>
        </div>  
        `)
  })
}



const setup = async () => {
  // test out poke api using axios here


  $('#pokeCards').empty()
  let response = await axios.get('https://pokeapi.co/api/v2/pokemon?offset=0&limit=810');
  pokemons = response.data.results;


  paginate(currentPage, PAGE_SIZE, pokemons)
  const numPages = Math.ceil(pokemons.length / PAGE_SIZE)
  updatePaginationDiv(currentPage, numPages)



  // pop up modal when clicking on a pokemon card
  // add event listener to each pokemon card
  $('body').on('click', '.pokeCard', async function (e) {
    const pokemonName = $(this).attr('pokeName')
    // console.log("pokemonName: ", pokemonName);
    const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`)
    // console.log("res.data: ", res.data);
    const types = res.data.types.map((type) => type.type.name)
    // console.log("types: ", types);
    $('.modal-body').html(`
        <div style="width:200px">
        <img src="${res.data.sprites.other['official-artwork'].front_default}" alt="${res.data.name}"/>
        <div>
        <h3>Abilities</h3>
        <ul>
        ${res.data.abilities.map((ability) => `<li>${ability.ability.name}</li>`).join('')}
        </ul>
        </div>

        <div>
        <h3>Stats</h3>
        <ul>
        ${res.data.stats.map((stat) => `<li>${stat.stat.name}: ${stat.base_stat}</li>`).join('')}
        </ul>

        </div>

        </div>
          <h3>Types</h3>
          <ul>
          ${types.map((type) => `<li>${type}</li>`).join('')}
          </ul>
      
        `)
    $('.modal-title').html(`
        <h2>${res.data.name.toUpperCase()}</h2>
        <h5>${res.data.id}</h5>
        `)
  })

  // add event listener to pagination buttons
  $('body').on('click', ".numberedButtons", async function (e) {
    currentPage = Number(e.target.value)
    paginate(currentPage, PAGE_SIZE, pokemons)

    //update pagination buttons
    updatePaginationDiv(currentPage, numPages)

    
  })

  
}


$(document).ready(setup)