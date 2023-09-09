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

let pokeList = document.querySelector("#pokelist"); //saving the pokemon list HTML element in a variable
let largestWeight = 0; //variable to track the largest weight of a pokemon
let largestPokemon; //variable to track the largest pokemon

//for loop to add each pokemon as a list item to the pokemon list
for (let i = 0; i < pokemonList.length; i++) {
  let pokeItem = document.createElement("li");
  let text = document.createTextNode(
    `${pokemonList[i].name} (weight: ${pokemonList[i].weight})`
  );

  //updating the largest pokemon variables with each loop iteration
  if (pokemonList[i].weight > largestWeight) {
    largestWeight = pokemonList[i].weight;
    largestPokemon = pokemonList[i];
  }

  //appending the pokemon to the list
  pokeItem.setAttribute("id", pokemonList[i].name);
  pokeItem.appendChild(text);
  pokeList.appendChild(pokeItem);
}

//adding a note to the largest pokemon
document.querySelector(`#${largestPokemon.name}`).appendChild(document.createTextNode(" - That's a chunky boi!!"))