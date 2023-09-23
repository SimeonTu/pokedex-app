let pokemonRepository = (function () {
  let pokeList = document.querySelector("#pokelist"); //saving the pokemon list HTML element in a variable
  let modalContainer = document.querySelector("#modal-container"); //container for the modal shown when a pokemon is clicked
  let largestWeight = 0; //variable to track the largest weight of a pokemon
  let largestPokemon; //variable to track the largest pokemon
  let apiUrl = "https://pokeapi.co/api/v2/pokemon/?limit=150";

  //array containing a list of Pokemon
  let pokemonList = [];

  //defining "loading" elements
  // let heading = document.querySelector('h1')
  let loadingWrapper = document.createElement("div");
  let loadingGif = document.createElement("img");
  let loadingText = document.createElement("p");

  loadingWrapper.classList.add("loading-wrapper");
  loadingGif.classList.add("loading-gif");
  loadingGif.src = "./img/pikachu-running.gif";
  loadingText.classList.add("loading-text");
  loadingText.innerHTML = "Loading data...";

  loadingWrapper.appendChild(loadingGif);
  loadingWrapper.appendChild(loadingText);

  // artificial delay function
  // const delay = (delayInms) => {
  //   return new Promise((resolve) => setTimeout(resolve, delayInms));
  // };

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
    button.addEventListener("click", function () {
      showModal(poke);
    });
    pokeItem.appendChild(button);

    //appending the pokemon to the list
    pokeItem.setAttribute("id", poke.name);
    pokeList.appendChild(pokeItem);
  }

  //function to feed into button event listener. logs selected pokemon into the console
  // function showDetails(poke) {
  //     showModal(poke);
  // }

  //function to add event listener to button
  function buttonListener(button, poke) {}

  async function loadList() {
    h1 = document.querySelector("h1");
    h1.parentNode.insertBefore(loadingWrapper, h1.nextSibling); //insert loading wrapper below Pokemon heading
    showLoadingMessage();

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

          //capitalize first letter of each pokemon
          pokemon.name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);

          //add pokemon to list
          add(pokemon);

        });
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  function showLoadingMessage() {
    loadingWrapper.classList.add("display");
  }

  function hideLoadingMessage() {
    loadingWrapper.classList.remove("display");
  }

  async function loadDetails(poke) {
    // Clear all existing modal content
    modalContainer.innerHTML = "";

    let modal = document.createElement("div");
    modal.classList.add("modal");

    // Add the new modal content
    let closeButtonElement = document.createElement("button");
    closeButtonElement.classList.add("modal-close");
    closeButtonElement.innerText = "Close";
    closeButtonElement.addEventListener("click", hideModal);

    modal.appendChild(closeButtonElement);
    modalContainer.appendChild(modal);

    modalContainer.classList.add("is-visible");

    modal.appendChild(loadingWrapper);
    showLoadingMessage();
    // await delay(1000);

    let url = poke.detailsUrl;
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        hideLoadingMessage();
        // Now we add the details to the item
        poke.id = details.id;
        poke.imageUrl = details.sprites.other["official-artwork"].front_default;
        poke.height = details.height / 10; //devided by 10 because data is stored in decimeters
        poke.weight = details.weight / 10;
        poke.types = details.types;
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  function gridItem(poke, property, description) {
    let item = document.createElement("div");
    item.classList.add("grid-item");

    let itemTitle = document.createElement("p");
    itemTitle.classList.add("grid-title");
    itemTitle.innerText = property;

    let itemDescription = document.createElement("p");
    itemDescription.classList.add("grid-description");
    itemDescription.innerText = description;

    item.appendChild(itemTitle);
    item.appendChild(itemDescription);

    return item;
  }

  async function showModal(poke) {
    loadDetails(poke).then(function () {
      console.log(poke);

      let modal = document.querySelector(".modal");

      let title = document.createElement("p");
      let titleSpan = document.createElement("span");
      title.classList.add("modal-poke-title");
      title.innerText = poke.name;
      titleSpan.innerText = `#${poke.id}`;
      title.appendChild(titleSpan);

      let infoWrapper = document.createElement("div");
      infoWrapper.classList.add("modal-info-wrapper");

      let imageWrapper = document.createElement("div");
      let image = document.createElement("img");
      imageWrapper.classList.add("modal-info-image-wrapper");
      imageWrapper.appendChild(image);
      image.src = poke.imageUrl;
      infoWrapper.appendChild(imageWrapper);

      let statsWrapper = document.createElement("div");
      statsWrapper.classList.add("modal-info-stats-grid");
      statsWrapper.appendChild(gridItem(poke, "Height", `${poke.height} m`));
      statsWrapper.appendChild(gridItem(poke, "Weight", `${poke.weight} kg`));
      infoWrapper.appendChild(statsWrapper);

      //       info.innerText = `
      // Height: ${poke.height} m
      // Weight: ${poke.weight} kg
      // Types: ${pokeTypes}`;

      let pokeTypes = [];
      poke.types.forEach((types) => pokeTypes.push(types.type.name));
      console.log(pokeTypes);

      modal.appendChild(title);
      modal.appendChild(infoWrapper);
    });
  }

  function hideModal() {
    modalContainer.classList.remove("is-visible");
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalContainer.classList.contains("is-visible")) {
      hideModal();
    }
  });

  modalContainer.addEventListener("click", (e) => {
    // Since this is also triggered when clicking INSIDE the modal container,
    // We only want to close if the user clicks directly on the overlay
    let target = e.target;
    if (target === modalContainer) {
      hideModal();
    }
  });

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
