let pokemonRepository = (function () {
  let pokeList = $("#pokelist"); //saving the pokemon list HTML element in a variable
  let modalContainer = document.querySelector("#modal-container"); //container for the modal shown when a pokemon is clicked
  let largestWeight = 0; //variable to track the largest weight of a pokemon
  let largestPokemon; //variable to track the largest pokemon

  //array containing a list of Pokemon
  let pokemonList = [];

  //Value used to determine which Pokemon to load
  let offset;

  //defining "loading" elements
  // let heading = document.querySelector('h1')
  let loadingWrapper = $(`<div class="loading-wrapper">
                            <img class="loading-gif" src="./img/pikachu-running.gif">
                          </div>`);

  pokeCursors();

  //// artificial delay function
  const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

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
      $(`<div class="col col-sm-6 col-lg-4 col-xxl-3 poke-item-col" data-bs-toggle="modal" data-bs-target="#pokeModal">
                      <div class="poke-item">
                        <div class="poke-thumbnail">
                          <img src="${poke.imageUrl}"/>
                        </div>
                        <div class="poke-info">
                          <p class="poke-id">#</p>
                          <p class="poke-name">${poke.name}</p>
                          <div class="poke-types">
                          </div>
                        </div>
                      </div>
        </div>`);

    //Hide item so that it can be shown with a fancy animation
    pokeItem.hide();

    //Set Pokemon ID to this format: "#0000"
    let id =
      poke.id < 10
        ? `#000${poke.id}`
        : poke.id >= 10 && poke.id < 100
        ? `#00${poke.id}`
        : poke.id >= 100 && poke.id < 1000
        ? `#0${poke.id}`
        : `#${poke.id}`;

    pokeItem
      .children(".poke-item")
      .children(".poke-info")
      .children(".poke-id")
      .text(id);

    //Append Pokemon types
    poke.types.forEach(function (type) {
      pokeItem
        .children(".poke-item")
        .children(".poke-info")
        .children(".poke-types")
        .append($(`<span class="pill bg-color-${type}">${type}</span>`));
    });

    //Show modal when clicked
    pokeItem.on("click", () => showModal(poke));

    $(".poke-row").append(pokeItem);
  }

  function loadData(num, max) {
    pokemonList = [];

    loadList(num, max)
      .then(function () {
        pokemonList.forEach(function (poke) {
          // console.log(poke)
          addListItem(poke);
        });
      })
      .then(() => loadPokesAnim());
  }

  $("#btn-load-pokemon").on("click", function () {
    $("#btn-load-pokemon").remove();
    loadData(offset + 1, offset + 16);
    $("#pokelist").append($("<observer></obeserver>"));

    setTimeout(async () => {
      const intersectionObserver = new IntersectionObserver(async function (
        entries
      ) {
        // If intersectionRatio is 0, the target is out of view
        // and we do not need to do anything.
        console.log(entries);
        if (entries[0].isIntersecting) {
          $("observer").remove();
          console.log("SEEN!!");
          $(".poke-row").append(loadingWrapper);
          loadingWrapper.addClass("display");
          await delay(1000);

          // intersectionObserver.unobserve($("observer")[0]);
          console.log("NOT OBSERVING");

          loadData(offset + 1, offset + 16);

          setTimeout(() => {
            $("#pokelist").append($("<observer></obeserver>"));
            intersectionObserver.observe($("observer")[0]);
            console.log("OBSERVING");
          }, 1800);
        }
      });
      // start observing
      intersectionObserver.observe($("observer")[0]);
    }, 1800);
  });

  async function loadList(num, max) {
    loadingWrapper.addClass("display");
    // await delay(1000)

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

      loadingWrapper.remove();
    });
  }

  // loadList().then(
  //   setTimeout(function() {
  //     pokemonList.forEach(function (poke) {
  //         console.log(poke);
  //         addListItem(poke);
  //       })
  //     }, 500)
  // );

  loadData(1, 16);

  //   // Now the data is loaded!
  //   // console.log(pokemonRepository.getAll()[0])
  //   pokemonRepository.getAll().forEach(function (pokemon) {
  //     // console.log(pokemon)
  //     pokemonRepository.addListItem(pokemon);
  //   });
  // });

  function loadPokesAnim() {
    if (window.matchMedia("(max-width: 576px)").matches) {
      $(".poke-item-col").show();
    } else {
      $(".poke-item-col")
        .first()
        .show(100, function showNext() {
          $(this).next(".col").show(100, showNext);
        });
    }
  }

  async function loadDetails(poke) {
    console.log(poke);
    let modalBody = $(".modal-body");
    let modalTitle = $(".modal-title");

    modalTitle.empty();
    modalBody.empty();
    modalBody.append(loadingWrapper);
    loadingWrapper.addClass("display");
    // await delay(1000);

    let url = `https://pokeapi.co/api/v2/pokemon/${poke.id}`;
    return fetch(url)
      .then(function (response) {
        return response.json();
      })
      .then(function (details) {
        loadingWrapper.removeClass("display");
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
      console.log("loaded details...");
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
