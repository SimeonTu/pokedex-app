let pokemonRepository = (function () {
  let pokeList = $("#pokelist"); //saving the pokemon list HTML element in a variable
  let modalContainer = document.querySelector("#modal-container"); //container for the modal shown when a pokemon is clicked
  let largestWeight = 0; //variable to track the largest weight of a pokemon
  let largestPokemon; //variable to track the largest pokemon

  //array containing a list of Pokemon
  let pokemonList = [];

  let offset;

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

  pokeCursors();

  //// artificial delay function
  // const delay = (delayInms) => {
  //   return new Promise((resolve) => setTimeout(resolve, delayInms));
  // };

  //// Might be useful later for a new feature ////
  // function filterPokemon(filterPoke) {
  //   if (pokemonList.some((poke) => poke.name === filterPoke)) {
  //     let filteredPoke = pokemonList.filter((poke) => poke.name === filterPoke);
  //     addListItem(filteredPoke[0]);
  //   } else {
  //     console.log("Invalid Pokemon");
  //   }
  // }

  // function largestPokeNote() {
  //   pokemonList.forEach(function (poke) {
  //     //updating the largest pokemon variables with each loop iteration
  //     if (poke.weight > largestWeight) {
  //       largestWeight = poke.weight;
  //       largestPokemon = poke;
  //     }
  //   });
  //   document
  //     .querySelector(`#${largestPokemon.name}`)
  //     .appendChild(document.createTextNode(" - That's a chunky boi!!"));
  // }

  function getAll() {
    return pokemonList;
  }

  //function to add each pokemon as a list item to the pokemon list
  function addListItem(poke) {
    let pokeItem =
      $(`<div class="col col-sm-6 col-lg-4 col-xxl-3 poke-item-col">
                        <div class="poke-thumbnail">
                          <img src="${poke.imageUrl}"/>
                        </div>
                        <div class="poke-info">
                          <p class="poke-id">#${poke.id}</p>
                          <p class="poke-name">${poke.name}</p>
                          <div class="poke-types">
                          </div>
                        </div>
                      </div>`);

    console.log(poke.types);

    poke.types.forEach(function (type) {
      pokeItem
        .children(".poke-info")
        .children(".poke-types")
        .append($(`<span class="pill bg-color-${type}">${type}</span>`));
    });

    //   let button =
    //     $(`<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    //   ${poke.name}
    // </button>`);

    //   button.on("click", function () {
    //     showModal(poke);
    //   });
    //   pokeItem.append(button);

    //   //appending the pokemon to the list
    //   pokeItem.attr("id", poke.name);

    pokeItem.hide();
    $(".poke-row").append(pokeItem);
  }

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

  $("#test").on("click", function () {
    pokemonList = [];

    loadList(offset + 1, offset + 16).then(function () {
      pokemonList.forEach(function (poke) {
        // console.log(poke)
        addListItem(poke);
      });
    }).then( () => showPokesAnim() )

  });

  async function loadList(num, max) {
    h1 = document.querySelector("#main-heading");
    h1.parentNode.insertBefore(loadingWrapper, h1.nextSibling); //insert loading wrapper below Pokemon heading
    showLoadingMessage();

    offset = max;

    for (num; num <= max; num++) {
      const url = `https://pokeapi.co/api/v2/pokemon/${num}`;
      pokemonList.push(fetch(url).then((res) => res.json()));
    }

    return Promise.all(pokemonList).then((poke) => {
      console.log(poke);

      pokemonList = poke.map((item) => ({
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        id: item.id,
        imageUrl: item.sprites.other["official-artwork"].front_default,
        types: item.types.map((types) => types.type.name),
      }));

      hideLoadingMessage();
    });

    //capitalize first letter of each pokemon
    // pokemon.name =
    //   pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  }

  // loadList().then(
  //   setTimeout(function() {
  //     pokemonList.forEach(function (poke) {
  //         console.log(poke);
  //         addListItem(poke);
  //       })
  //     }, 500)
  // );

  loadList(1, 16).then(function () {
    pokemonList.forEach(function (poke) {
      // console.log(poke)
      addListItem(poke);
    })
  }).then( () => showPokesAnim());;

  
  //   // Now the data is loaded!
  //   // console.log(pokemonRepository.getAll()[0])
  //   pokemonRepository.getAll().forEach(function (pokemon) {
  //     // console.log(pokemon)
  //     pokemonRepository.addListItem(pokemon);
  //   });
  // });

  function showPokesAnim() {
      $(".poke-item-col").first().show(100, function showNext() {
        $(this).next('div').show(100, showNext);
      });
  }

  function showLoadingMessage() {
    loadingWrapper.classList.add("display");
  }

  function hideLoadingMessage() {
    loadingWrapper.classList.remove("display");
  }

  async function loadDetails(poke) {
    let modalBody = $(".modal-body");
    let modalTitle = $(".modal-title");

    modalTitle.empty();
    modalBody.empty();
    modalBody.append(loadingWrapper);
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
        poke.height = details.height / 10; //divided by 10 because data is stored in decimeters
        poke.weight = details.weight / 10;
        poke.types = details.types.map((types) => types.type.name);
        poke.stats = details.stats.map(function (item) {
          return {
            name: item.stat.name.replace(/(^\w)|([-\s]\w)/g, (letter) =>
              letter.toUpperCase()
            ), //Capitalize beginning of every word using regex
            value: item.base_stat,
          };
        });
      })
      .catch(function (e) {
        console.error(e);
      });
  }

  function infoItem(poke, property, description) {
    let column = $('<div class="col grid-item"></div');

    let itemTitle = $(`<p class="grid-title"> ${property} </p>`);
    let itemDescription = $(`<p class="grid-description"> ${description} </p>`);

    column.append(itemTitle);
    column.append(itemDescription);

    return column;
  }

  function statsItem(poke) {
    let statsColumn = $('<div class="col-12"></div>');
    let statsItem;

    poke.stats.forEach(function (stat) {
      statsItem = $('<div class="stats-wrapper"></div>');
      let statsName = $(`<p class="grid-title"> ${stat.name} </p>`);
      let statsProgress =
        $(`<div class="progress progress-striped active" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="255">
      <div class="progress-bar progress-bar-success" style="width: 0%"></div>
    </div>`);
      statsProgress.attr("aria-valuenow", stat.value);
      statsProgress.children("div").html(stat.value);
      statsItem.append(statsName);
      statsItem.append(statsProgress);

      statsColumn.append(statsItem);

      statsItem
        .children("div")
        .children(".progress-bar")
        .animate(
          { width: stat.value / 2.55 + "%" },
          1750,
          "easeOutBounce" //Pokemon stats go from 0 to 255 so in order to get the % width value from 0% to 100% we divide by 2.55
        );
    });

    return statsColumn;
  }

  async function showModal(poke) {
    loadDetails(poke).then(function () {
      console.log(poke);

      let modalBody = $(".modal-body");
      let modalTitle = $(".modal-title");
      let modalHeader = $(".modal-header");
      modalTitle.empty();
      modalBody.empty();

      let title = poke.name;
      let titleSpan = $(`<span> #${poke.id} </span>`);

      let modalInfo = $("<div></div>");
      modalInfo.addClass("modal-info-wrapper");

      let imageWrapper = $("<div></div>");
      let image = $("<img />", { src: poke.imageUrl });
      imageWrapper.addClass("modal-info-image-wrapper");
      imageWrapper.append(image);
      modalInfo.append(imageWrapper);

      let infoWrapper = $(
        '<div class="container text-center modal-info-stats-grid"></div>'
      );
      let infoRow = $('<div class="row"></div>');
      infoWrapper.append(infoRow);
      infoRow.append(infoItem(poke, "Height", `${poke.height} m`));
      infoRow.append(infoItem(poke, "Weight", `${poke.weight} kg`));

      infoRow.append(statsItem(poke));

      modalInfo.append(infoWrapper);

      //       info.innerText = `
      // Height: ${poke.height} m
      // Weight: ${poke.weight} kg
      // Types: ${pokeTypes}`;

      modalTitle.text(title);
      modalTitle.append(titleSpan);

      modalBody.append(modalInfo);
    });
  }

  function pokeCursors() {
    let randomCursor = () =>
      Math.floor(
        Math.random() * (Math.floor(12) - Math.ceil(1)) + Math.ceil(1)
      );
    let anchorList = document.getElementsByTagName("a");
    document.body.style = `cursor: url('img/cursors/${randomCursor()}.cur'), auto;`;
    for (let i = 0; i < anchorList.length; i++) {
      anchorList[
        i
      ].style = `cursor: url('img/cursors/${randomCursor()}.cur'), auto;`;
    }
  }

  // function hideModal() {
  //   modalContainer.classList.remove("is-visible");
  // }

  // window.addEventListener("keydown", (e) => {
  //   if (e.key === "Escape" && modalContainer.classList.contains("is-visible")) {
  //     hideModal();
  //   }
  // });

  // modalContainer.addEventListener("click", (e) => {
  //   // Since this is also triggered when clicking INSIDE the modal container,
  //   // We only want to close if the user clicks directly on the overlay
  //   let target = e.target;
  //   if (target === modalContainer) {
  //     hideModal();
  //   }
  // });

  return {
    add: add,
    getAll: getAll,
    addListItem: addListItem,
    // largestPokeNote: largestPokeNote,
    // filterPokemon: filterPokemon,
    loadList: loadList,
    loadDetails: loadDetails,
    pokeCursors: pokeCursors,
  };
})();

// pokemonRepository.loadList().then(function () {
//   // Now the data is loaded!
//   // console.log(pokemonRepository.getAll()[0])
//   pokemonRepository.getAll().forEach(function (pokemon) {
//     // console.log(pokemon)
//     pokemonRepository.addListItem(pokemon);
//   });
// });

// let pokemonList = pokemonRepository.getAll();

// pokemonList.forEach(pokemonRepository.displayPokemon);

// pokemonRepository.filterPokemon("Bulbasaur");
