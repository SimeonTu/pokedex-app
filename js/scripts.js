let pokemonRepository = (function () {
  let pokeList = document.querySelector("#pokelist"); //saving the pokemon list HTML element in a variable
  let largestWeight = 0; //variable to track the largest weight of a pokemon
  let largestPokemon; //variable to track the largest pokemon
  let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";

  //array containing a list of Pokemon
  let pokemonList = [];

  //defining "loading" elements
  let heading = document.querySelector('h1')
  let loadingWrapper = document.createElement('div');
  let loadingGif = document.createElement('img')
  let loadingText = document.createElement('p')

  loadingWrapper.classList.add('loading-wrapper')
  loadingGif.classList.add('loading-gif')
  loadingGif.src = './img/pikachu-running.gif'
  loadingText.classList.add('loading-text')
  loadingText.innerHTML = "Loading..."

  loadingWrapper.appendChild(loadingGif)
  loadingWrapper.appendChild(loadingText)
  heading.parentNode.insertBefore(loadingWrapper, heading.nextSibling); //insert loading wrapper after "Pokemon" heading element

  const delay = ms => new Promise(res => setTimeout(res, ms)); //artificial delay function

  function add(newPokemon) {
    //base keys to compare
    let pokeKeys = { name: "", detailsUrl: "" };
    //variable that has a function that checks whether two objects have the same keys
    const haveSameKeys = function (obj1, obj2) {
      return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key));
    };

    //check whether new pokemon is an object and has the proper keys
    if (
      typeof newPokemon === "object" &&
      haveSameKeys(pokeKeys, newPokemon) === true
    ) {
      pokemonList.push(newPokemon);
    } else {
      console.log("New pokemon is not valid");
    }
  }

  function getAll() {
    return pokemonList;
  }

  function filterPokemon(filterPoke) {
    if (pokemonList.some((poke) => poke.name === filterPoke)) {
      let filteredPoke = pokemonList.filter((poke) => poke.name === filterPoke);
      addListItem(filteredPoke[0]);
    } else {
      console.log("Invalid Pokemon");
    }
  }

  function largestPokeNote() {
    pokemonList.forEach(function (poke) {
      //updating the largest pokemon variables with each loop iteration
      if (poke.weight > largestWeight) {
        largestWeight = poke.weight;
        largestPokemon = poke;
      }
    });
    document
      .querySelector(`#${largestPokemon.name}`)
      .appendChild(document.createTextNode(" - That's a chunky boi!!"));
  }

  //function to add each pokemon as a list item to the pokemon list
  function addListItem(poke) {
    let pokeItem = document.createElement("li");
    let button = document.createElement("button");
    button.innerText = poke.name;
    button.classList.add("poke-button");
    buttonListener(button, poke);
    pokeItem.appendChild(button);

    //appending the pokemon to the list
    pokeItem.setAttribute("id", poke.name);
    pokeList.appendChild(pokeItem);
  }

  //function to feed into button event listener. logs selected pokemon into the console
  function showDetails(poke) {
    loadDetails(poke).then(function () {
      console.log(poke);
    });
  }

  //function to add event listener to button
  function buttonListener(button, poke) {
    button.addEventListener("click", function () {
      showDetails(poke);
    });
  }

  async function loadList() {
    showLoadingMessage();
    await delay(1000)
    return fetch(apiUrl)
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        hideLoadingMessage();
        json.results.forEach(function (item) {
          let pokemon = {
            name: item.name,
            detailsUrl: item.url,
          };
          add(pokemon);
        });
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  async function loadDetails(poke) {
    showLoadingMessage();
    await delay(1000)
    let url = poke.detailsUrl;
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        hideLoadingMessage();
        // Now we add the details to the item
        poke.imageUrl = details.sprites.front_default;
        poke.height = details.height;
        poke.types = details.types;
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  function showLoadingMessage() {
    loadingWrapper.classList.add('display')
  }

  function hideLoadingMessage() {
    loadingWrapper.classList.remove('display')
  }

  return {
    add: add,
    getAll: getAll,
    addListItem: addListItem,
    largestPokeNote: largestPokeNote,
    filterPokemon: filterPokemon,
    loadList: loadList,
    loadDetails: loadDetails,
  };
})();

pokemonRepository.loadList().then(function () {
  // Now the data is loaded!
  pokemonRepository.getAll().forEach(function (pokemon) {
    pokemonRepository.addListItem(pokemon);
  });
});

// let pokemonList = pokemonRepository.getAll();

// pokemonList.forEach(pokemonRepository.displayPokemon);

// pokemonRepository.filterPokemon("Bulbasaur");
