let pokemonRepository = (function () {
  const colorThief = new ColorThief();

  //array containing a list of Pokemon
  let pokemonList = [];

  //Value used to determine which Pokemon to load
  let offset;
  // Variable to track selected Pokemon generation
  let gen;
  // Variable to determine whether to load more Pokemon or not
  let end;

  let flag = 0;

  //defining "loading" elements
  // let heading = document.querySelector('h1')
  let loadingWrapper = $(`<div class="loading-wrapper">
                            <img class="loading-gif" src="./img/pikachu-running.gif">
                          </div>`);
  // let loadingWrapperList = $(`<div class="loading-wrapper" id="loading-2">
  //                           <img class="loading-gif" src="./img/pikachu-running.gif">
  //                         </div>`);

  pokeCursors();

  //Function to convert RGB values to HSL. Used later to brighten pokemon thumbnail background color.
  const RGBToHSL = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0;
    let sat = 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0) + "%";
    let light = (100 * (2 * l - s)) / 2 + 20;
    if (light > 100) {
      light = 100;
    }
    light = light + "%";
    return [60 * h < 0 ? 60 * h + 360 : 60 * h, sat, light].toString();
  };

  const intersectionObserver = new IntersectionObserver(async function (entries) {
    // If intersectionRatio is 0, the target is out of view
    // and we do not need to do anything.
    console.log(entries);

    if (entries[0].isIntersecting && flag == 1) {
      loadData(offset + 1, offset + 16);
    } else if (entries[0].isIntersecting && flag == 0) {
      console.log("flag within observer: " + flag);
      $("observer").remove();
      console.log("SEEN!!");
      // $(".poke-row").append(loadingWrapper);
      // loadingWrapper.addClass("display");
      // await delay(1800);

      // intersectionObserver.unobserve($("observer")[0]);
      console.log("NOT OBSERVING");

      loadData(offset + 1, offset + 16);
      setTimeout(() => {
        $("#pokelist").append($("<observer></obeserver>"));
        intersectionObserver.observe($("observer")[0]);
        console.log("OBSERVING");
      }, 2200);
    }
  });

  //// artificial delay function
  const delay = (delayInms) => {
    return new Promise((resolve) => setTimeout(resolve, delayInms));
  };

  function getAll() {
    return pokemonList;
  }

  //function to add each pokemon as a list item to the pokemon list
  function addListItem(poke) {
    let pokeItem = $(`<div class="col col-xs-12 col-sm-6 col-md-4 col-lg-3 poke-item-col" data-bs-toggle="modal" data-bs-target="#pokeModal">
                      <div class="poke-item poke-item-${poke.id}">
                        <div class="poke-thumbnail">
                          <div class="poke-thumbnail-bg">
                          </div>
                          <img id="poke-img-${poke.id}" src="${poke.imageUrl}"/>
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
    let id = poke.id < 10 ? `#000${poke.id}` : poke.id >= 10 && poke.id < 100 ? `#00${poke.id}` : poke.id >= 100 && poke.id < 1000 ? `#0${poke.id}` : `#${poke.id}`;

    // pokeItem.children(".poke-item").css("background-color", "red")
    pokeItem.children(".poke-item").children(".poke-info").children(".poke-id").text(id);

    //Append Pokemon types
    poke.types.forEach(function (type) {
      pokeItem
        .children(`.poke-item-${poke.id}`)
        .children(".poke-info")
        .children(".poke-types")
        .append($(`<span class="pill bg-color-${type}">${type}</span>`));
    });

    //Show modal when clicked
    pokeItem.on("click", () => showModal(poke));

    $(".poke-row").append(pokeItem);
    let img = document.querySelector(`#poke-img-${poke.id}`);
    img.crossOrigin = "Anonymous";

    if (img.complete) {
      let pokeSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" style="opacity:0.75; transform:rotate(145deg);" id="Layer_1" data-name="Layer 1" viewBox="0 0 910.13 908.95"><defs><style>.cls-1{fill:%23fff;opacity:0;}.cls-2{fill:rgb(${colorThief
        .getColor(img)
        .toString()});}.cls-3{fill:rgb(${colorThief
        .getColor(img)
        .toString()});}</style></defs><title>Pokeball</title><path class="cls-1" d="M337,730c.61-252,204.75-455.12,456.36-454.09,251.82,1,454.28,204.19,453.77,455.38s-204.7,454.42-455.63,453.56C539.59,1184,336.4,980.67,337,730Z" transform="translate(-337 -275.94)"/><path class="cls-2" d="M510,764.63c35.7,0,71.41.21,107.11-.17,7.31-.08,10.2,2,12,9.28,18.82,73.7,86,125.21,163,125.39A168.44,168.44,0,0,0,955.42,773.8c2-7.44,4.77-9.34,12-9.31q107.67.35,215.35,0c8,0,9.52,1.5,8.64,9.91-17.11,163.09-136.13,305.55-302.49,345.19-136.23,32.45-259,1.84-364.57-90.72-72-63.09-113.69-143.59-129.42-237.73-4.43-26.52-4.49-26.5,22.66-26.5Z" transform="translate(-337 -275.94)"/><path class="cls-3" d="M1073.7,695.83c-34.94,0-69.89-.26-104.82.19-8.34.11-11.65-2.73-13.91-10.64C935.18,616,874.39,565.77,806.24,562c-76.78-4.26-141.58,35.28-170.68,104.14-.87,2.07-1.66,4.19-2.38,6.31-8,23.38-8,23.38-33.4,23.38-64.63,0-129.25-.15-193.88.15-9.61,0-13.84-.92-12.11-12.72,22.8-155.69,106.22-266.09,251.65-325,156.73-63.54,330.1-21.39,443.93,103.13,57.07,62.43,90.45,136.3,101,220.32,1.76,14.11,1.64,14.15-12.93,14.16Q1125.56,695.84,1073.7,695.83Z" transform="translate(-337 -275.94)"/><path class="cls-2" d="M793.12,848.53c-64.13.57-118.48-51.88-119-114.84-.55-67.27,51.26-121,117.05-121.43,64.85-.41,118.47,52.27,119.29,117.21C911.3,794,858.11,848,793.12,848.53Z" transform="translate(-337 -275.94)"/><path class="cls-1" d="M793.1,672.52c32.69.37,57.55,26.21,57.15,59.39-.39,31.86-26.4,56.79-59,56.55a57.74,57.74,0,0,1-57.36-58.33C734.31,697.35,760.2,672.15,793.1,672.52Z" transform="translate(-337 -275.94)"/></svg>`;
      document.querySelector(`.poke-item-${poke.id}`).style.backgroundColor = `hsl(${RGBToHSL(...colorThief.getColor(img))})`;
      pokeItem.children(".poke-item").children(".poke-thumbnail").children(".poke-thumbnail-bg").css("background-image", `url('${pokeSvg}')`);
      console.log("img complete: " + poke.name);
      console.log(RGBToHSL(...colorThief.getColor(img)));
      console.log(colorThief.getColor(img).toString());
    } else {
      img.addEventListener("load", function () {
        let pokeSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" style="opacity:0.75; transform:rotate(145deg);" id="Layer_1" data-name="Layer 1" viewBox="0 0 910.13 908.95"><defs><style>.cls-1{fill:%23fff;opacity:0;}.cls-2{fill:rgb(${colorThief
          .getColor(img)
          .toString()});}.cls-3{fill:rgb(${colorThief
          .getColor(img)
          .toString()});}</style></defs><title>Pokeball</title><path class="cls-1" d="M337,730c.61-252,204.75-455.12,456.36-454.09,251.82,1,454.28,204.19,453.77,455.38s-204.7,454.42-455.63,453.56C539.59,1184,336.4,980.67,337,730Z" transform="translate(-337 -275.94)"/><path class="cls-2" d="M510,764.63c35.7,0,71.41.21,107.11-.17,7.31-.08,10.2,2,12,9.28,18.82,73.7,86,125.21,163,125.39A168.44,168.44,0,0,0,955.42,773.8c2-7.44,4.77-9.34,12-9.31q107.67.35,215.35,0c8,0,9.52,1.5,8.64,9.91-17.11,163.09-136.13,305.55-302.49,345.19-136.23,32.45-259,1.84-364.57-90.72-72-63.09-113.69-143.59-129.42-237.73-4.43-26.52-4.49-26.5,22.66-26.5Z" transform="translate(-337 -275.94)"/><path class="cls-3" d="M1073.7,695.83c-34.94,0-69.89-.26-104.82.19-8.34.11-11.65-2.73-13.91-10.64C935.18,616,874.39,565.77,806.24,562c-76.78-4.26-141.58,35.28-170.68,104.14-.87,2.07-1.66,4.19-2.38,6.31-8,23.38-8,23.38-33.4,23.38-64.63,0-129.25-.15-193.88.15-9.61,0-13.84-.92-12.11-12.72,22.8-155.69,106.22-266.09,251.65-325,156.73-63.54,330.1-21.39,443.93,103.13,57.07,62.43,90.45,136.3,101,220.32,1.76,14.11,1.64,14.15-12.93,14.16Q1125.56,695.84,1073.7,695.83Z" transform="translate(-337 -275.94)"/><path class="cls-2" d="M793.12,848.53c-64.13.57-118.48-51.88-119-114.84-.55-67.27,51.26-121,117.05-121.43,64.85-.41,118.47,52.27,119.29,117.21C911.3,794,858.11,848,793.12,848.53Z" transform="translate(-337 -275.94)"/><path class="cls-1" d="M793.1,672.52c32.69.37,57.55,26.21,57.15,59.39-.39,31.86-26.4,56.79-59,56.55a57.74,57.74,0,0,1-57.36-58.33C734.31,697.35,760.2,672.15,793.1,672.52Z" transform="translate(-337 -275.94)"/></svg>`;
        document.querySelector(`.poke-item-${poke.id}`).style.backgroundColor = `hsl(${RGBToHSL(...colorThief.getColor(img))})`;
        pokeItem.children(".poke-item").children(".poke-thumbnail").children(".poke-thumbnail-bg").css("background-image", `url('${pokeSvg}')`);
        console.log("waited for img:" + poke.name);
        console.log(RGBToHSL(...colorThief.getColor(img)));
        console.log(colorThief.getColor(img).toString());
      });
    }
  }

  function toggleButton() {
    let dropdown = $(".gen-dropdown-menu");
    let btn = $("#gen-dropdown-btn");

    if (dropdown.hasClass("toggle")) {
      dropdown.toggleClass("toggle");
      btn.css("background-color", "#5c636a");
      dropdown.slideDown();
    } else {
      dropdown.toggleClass("toggle");
      btn.css("background-color", "#6c757d");
      dropdown.slideUp();
    }
  }

  $("#gen-dropdown-btn").on("click", toggleButton);

  $(window).on("click", (e) => {
    if ($(".gen-dropdown-menu").css("display") == "block") {
      if (!Array.from(e.target.classList).includes("dropdown-item") && e.target.id != "gen-dropdown-btn" && e.target.id != "hamburger") {
        toggleButton();
      }
    }
  });

  $(window).scroll(function () {
    if ($(this).scrollTop() > 450) {
      $("#back-to-top").fadeIn();
      $("#back-to-top").css("display", "flex");
    } else {
      $("#back-to-top").fadeOut();
    }
  });
  // scroll body to 0px on click
  $("#back-to-top").click(function () {
    $("body,html").animate(
      {
        scrollTop: 0,
      },
      600,
      "easeOutQuad"
    );
    return false;
  });

  function checkGen(gen, num, max) {
    offset = max;

    if (gen == 1 && offset >= 151) {
      if (num > 151) {
        end = 1;
        return;
      }
      flag = 1;
      return 151;
    } else if (gen == 2 && offset >= 251) {
      if (num > 251) {
        end = 1;
        return;
      }
      flag = 1;
      return 251;
    } else if (gen == 3 && offset >= 386) {
      if (num > 386) {
        end = 1;
        return;
      }
      flag = 1;
      return 386;
    } else if (gen == 4 && offset >= 493) {
      if (num > 493) {
        end = 1;
        return;
      }
      flag = 1;
      return 493;
    } else if (gen == 5 && offset >= 649) {
      if (num > 649) {
        end = 1;
        return;
      }
      flag = 1;
      return 649;
    } else if (gen == 6 && offset >= 721) {
      if (num > 721) {
        end = 1;
        return;
      }
      flag = 1;
      return 721;
    } else if (gen == 7 && offset >= 809) {
      if (num > 809) {
        end = 1;
        return;
      }
      flag = 1;
      return 809;
    } else if (gen == 8 && offset >= 905) {
      if (num > 905) {
        end = 1;
        return;
      }
      flag = 1;
      return 905;
    } else if (gen == 9 && offset >= 1022) {
      if (num > 1022) {
        end = 1;
        return;
      }
      flag = 1;
      return 1022;
    } else {
      return max;
    }
  }

  function genButtons(generation, num) {
    $(`.gen-${generation}`).on("click", () => {
      if ($("#btn-load-pokemon").css("display") == "none") {
        $("#btn-load-pokemon").show();
      }

      if ($("observer").length) {
        intersectionObserver.unobserve($("observer")[0]);
      }

      if (end == 1) {
        end = 0;
      }

      //Set dropdown button text to current generation and add hamburger icon
      $("#gen-dropdown-btn")
        .text($(`.gen-${generation}`).html())
        .append($("<span id='hamburger'> ☰</span>"));

      //Clear value from search field
      $("input[type='text']").val("");

      toggleButton();

      gen = generation;
      flag = 3;
      $(".poke-row").empty();
      loadData(num + 1, num + 16);
      $(".dropdown-toggle").html($(`.gen-${generation}`).html());
    });
  }

  //Assign action listeners to each button in the dropdown
  for (let i = 1; i < 10; i++) {
    let num;
    switch (i) {
      case 1:
        num = 0;
        break;
      case 2:
        num = 151;
        break;
      case 3:
        num = 251;
        break;
      case 4:
        num = 386;
        break;
      case 5:
        num = 493;
        break;
      case 6:
        num = 649;
        break;
      case 7:
        num = 721;
        break;
      case 8:
        num = 809;
        break;
      case 9:
        num = 905;
        break;
    }
    genButtons(i, num);
  }

  // $(".dropdown").on("show.bs.dropdown", (e) => {
  //   $(".dropdown-menu").hide();
  //   $(".dropdown-menu").slideDown();
  // });

  // $(".poke-dropdown").on("click", (e) => {
  //   $(".dropdown-menu").css({"transform":"translate(-200px, 35px)"});
  //   console.log($(".dropdown-menu").css("transform"))
  //   $(".dropdown-menu").slideUp();
  // });

  $("#btn-load-pokemon").on("click", async function () {
    $("#btn-load-pokemon").hide();
    flag = 0;

    loadData(offset + 1, offset + 16);
    $("#pokelist").append($("<observer></obeserver>"));

    setTimeout(() => {
      // start observing
      intersectionObserver.observe($("observer")[0]);
    }, 1800);
  });

  $("form").on("submit", (e) => {
    console.log("submit test");
    filterPokemon(e);
    e.preventDefault();
  });

  //If the browser window is extra small, submit button won't be visible and a placeholder will be shown instead
  if ($(window).width() < 576) {
    console.log("window smol");
    $("input[type='text']").attr("placeholder", "Search");
  }

  function filterPokemon(e) {
    $("#gen-dropdown-btn").html("Generation <span id='hamburger'>☰</span>");
    end = 0;
    val = $("input[type='text']").val();
    console.log(val);

    if (!val) {
      if ($("#btn-load-pokemon").css("display") == "none") {
        $("#btn-load-pokemon").show();
      }
      $(".poke-row").empty();
      loadData(1, 16);
    } else {
      flag = 3;

      for (x in pokemonList) {
        if (pokemonList[x].name.toLowerCase() == val.toLowerCase()) {
          console.log("yes!");
          $(".poke-row").empty();
          addListItem(pokemonList[x]);
          loadPokesAnim();
          return;
        }
      }

      pokemonList = [];
      $(".poke-row").empty();
      $(".poke-row").append(loadingWrapper);
      $("#btn-load-pokemon").hide();
      getNames().then((names) => {
        let results = names.filter((pokeName) => pokeName.includes(val.toLowerCase()));

        if (results.length > 0) {
          console.log("yeppers");
          console.log(results);

          for (x in results) {
            let url = `https://pokeapi.co/api/v2/pokemon/${results[x].toLowerCase()}`;
            pokemonList.push(fetch(url).then((res) => res.json()));
          }

          Promise.all(pokemonList).then((poke) => {
            console.log(poke);
            console.log("success");
            $(".poke-row").empty();
            gen = 0;
            for (x in poke) {
              pokemonList = poke.map((item) => ({
                name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                id: item.id,
                imageUrl: item.sprites.other["official-artwork"].front_default,
                types: item.types.map((types) => types.type.name),
              }));
            }

            console.log(pokemonList);

            for (x in pokemonList) {
              addListItem(pokemonList[x]);
            }
            loadPokesAnim();
          });
        } else {
          console.log("Whoops!");
          loadingWrapper.remove();
          $(".poke-row").append("<span id='no-results-msg'>No Pokémon matched your search</span><img id='no-result-img' src='img/crying.gif'>");
          return;
        }
      });
    }
  }

  async function getNames() {
    return fetch("pokemonNames.txt")
      .then((res) => res.text())
      .then((text) => {
        // console.log(JSON.parse(text));
        return JSON.parse(text);
      })
      .catch((e) => console.error(e));
  }

  // getNames().then((val) => console.log(val));

  function loadData(num, max) {
    pokemonList = [];

    loadList(num, max)
      .then(function () {
        pokemonList.forEach(function (poke) {
          // console.log(poke)
          addListItem(poke);
        });
      })
      .then(() => {
        loadPokesAnim();
      });
  }

  async function loadList(num, max) {
    if (flag == 0 || flag == 3) {
      $(".poke-row").append(loadingWrapper);
      loadingWrapper.addClass("display");
      // await delay(1500);
    }

    offset = checkGen(gen, num, max);
    max = offset;

    if (end == 1) {
      console.log("end is equal to 1");
      return;
    }

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
            name: item.stat.name.replace(/(^\w)|([-\s]\w)/g, (letter) => letter.toUpperCase()), //Capitalize beginning of every word using regex
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

    let itemDescription = $(`<p class="grid-description"> ${description} </p>`);
    let itemTitle = $(`<p class="grid-title"> ${property} </p>`);

    column.append(itemDescription);
    column.append(itemTitle);

    return column;
  }

  function statsItem(poke) {
    let statsColumn = $('<div class="col-12"></div>');
    let statsItem;

    statsColumn.append($("<p class='grid-title stats'>Base stats</p>"));

    let statTitles = ["HP", "ATK", "DEF", "SP. ATK", "SP. DEF", "SPD"];
    let statColors = ["red", "orange", "blue", "lightblue", "grey", "green"];

    for (x in poke.stats) {
      statsItem = $('<div class="stats-wrapper"></div>');
      let statsName = $(`<p class="grid-title"> ${statTitles[x]} </p>`);
      let statsProgress = $(`<div class="progress progress-striped active" role="progressbar" aria-label="Basic example" aria-valuenow="0" aria-valuemin="0" aria-valuemax="255">
      <div class="progress-bar progress-bar-success" style="width: 0%"></div>
    </div>`);
      statsProgress.attr("aria-valuenow", poke.stats[x].value);
      //Show shorter stat number if progress bar is too small
      if (poke.stats[x].value / 2.55 < 10) {
        statsProgress.children("div").html(`${poke.stats[x].value}`);
      } else {
        statsProgress.children("div").html(`${poke.stats[x].value}/255`);
      }
      statsProgress.children("div").css("background-color", statColors[x]);
      statsItem.append(statsName);
      statsItem.append(statsProgress);

      statsColumn.append(statsItem);

      statsItem
        .children("div")
        .children(".progress-bar")
        .animate(
          { width: poke.stats[x].value / 2.55 + "%" },
          800,
          "easeOutCirc" //Pokemon stats go from 0 to 255 so in order to get the % width value from 0% to 100% we divide by 2.55
        );
    }

    return statsColumn;
  }

  async function showModal(poke) {
    loadDetails(poke).then(function () {
      console.log("loaded details...");
      let modalBody = $(".modal-body");
      modalBody.empty();

      let imageWrapper = $(`<div class='modal-info-image-wrapper modal-info-image-wrapper-${poke.id}'></div>`);
      let image = $(`<img id="poke-img-modal-${poke.id}" src='${poke.imageUrl}'/>`);
      imageWrapper.append(image);

      let infoWrapper = $('<div class="container text-center modal-info-stats-grid"></div>');
      infoWrapper.css("background", "linear-gradient(356deg, rgba(217,170,255,1) 0%, rgba(255,170,241,1) 100%)");
      let infoRow = $('<div class="row"></div>');
      infoWrapper.append(infoRow);

      //Set Pokemon ID to this format: "#0000"
      let id = poke.id < 10 ? `#000${poke.id}` : poke.id >= 10 && poke.id < 100 ? `#00${poke.id}` : poke.id >= 100 && poke.id < 1000 ? `#0${poke.id}` : `#${poke.id}`;
      infoRow.append($(`<p class="modal-poke-name">${poke.name}<span class="modal-poke-id"> ${id}</span></p>`));

      let pokeTypes = $("<div style='display:flex;justify-content:space-around; padding:0;' class='poke-types'></div>");
      poke.types.forEach(function (type) {
        pokeTypes.append($(`<span class=" pill bg-color-${type}">${type}</span>`));
      });
      infoRow.append(pokeTypes);

      infoRow.append(infoItem(poke, "Height", `${poke.height} m`));
      infoRow.append(infoItem(poke, "Weight", `${poke.weight} kg`));

      infoRow.append(statsItem(poke));

      imageWrapper.append($('<button type="button" style="position:absolute;right:20px;top:15px" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>'));
      modalBody.append(imageWrapper);
      modalBody.append(infoWrapper);

      let img = document.querySelector(`#poke-img-modal-${poke.id}`);
      img.crossOrigin = "Anonymous";

      if (img.complete) {
        document.querySelector(`.modal-info-image-wrapper-${poke.id}`).style.backgroundColor = `hsl(${RGBToHSL(...colorThief.getColor(img))})`;
        console.log("img complete: " + poke.name);
        console.log(colorThief.getColor(img).toString());
      } else {
        img.addEventListener("load", function () {
          document.querySelector(`.modal-info-image-wrapper-${poke.id}`).style.backgroundColor = `hsl(${RGBToHSL(...colorThief.getColor(img))})`;
          console.log("img complete: " + poke.name);
          console.log(colorThief.getColor(img).toString());
        });
      }
    });
  }

  function pokeCursors() {
    let randomCursor = () => Math.floor(Math.random() * (Math.floor(12) - Math.ceil(1)) + Math.ceil(1));
    let anchorList = document.getElementsByTagName("a");
    document.body.style = `cursor: url('img/cursors/${randomCursor()}.cur'), auto;`;
    for (let i = 0; i < anchorList.length; i++) {
      anchorList[i].style = `cursor: url('img/cursors/${randomCursor()}.cur'), auto;`;
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
    filterPokemon: filterPokemon,
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
