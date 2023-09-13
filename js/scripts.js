let pokemonRepository = (function () {
  let pokeList = document.querySelector("#pokelist"); //saving the pokemon list HTML element in a variable
  let largestWeight = 0; //variable to track the largest weight of a pokemon
  let largestPokemon; //variable to track the largest pokemon

  //array containing a list of Pokemon
  let pokemonList = [
    {
      name: "Bulbasaur",
      weight: 6.9,
      type: ["grass", "poison"],
    },
    {
      name: "Ivysaur",
      weight: 13,
      type: ["grass", "poison"],
    },
    {
      name: "Venasaur",
      weight: 100,
      type: ["grass", "poison"],
    },
  ];

  function add(newPokemon) {
    //base keys to compare
    let pokeKeys = { name: "", weight: "", type: "" };
    //variable that has a function that checks whether two objects have the same keys
    const haveSameKeys = function (obj1, obj2) {
        return Object.keys(obj1).every((key) => obj2.hasOwnProperty(key));
      }

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
      displayPokemon(filteredPoke[0]);
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
  function displayPokemon(poke) {
    let pokeItem = document.createElement("li");
    let text = document.createTextNode(`${poke.name} (weight: ${poke.weight})`);

    //appending the pokemon to the list
    pokeItem.setAttribute("id", poke.name);
    pokeItem.appendChild(text);
    pokeList.appendChild(pokeItem);
  }

  return {
    add: add,
    getAll: getAll,
    displayPokemon: displayPokemon,
    largestPokeNote: largestPokeNote,
    filterPokemon: filterPokemon,
  };
})();

pokemonRepository.add({
  name: "Test",
  weight: 120,
  type: ["grass", "poison"],
  test: ""
});

let pokemonList = pokemonRepository.getAll();

pokemonList.forEach(pokemonRepository.displayPokemon);

// pokemonRepository.filterPokemon("Bulbasaur");