import './css/base.scss';
import './css/styles.scss';

import domUpdates from './domUpdates';

import Pantry from './pantry';
import Recipe from './recipe';
import User from './user';
import Cookbook from './cookbook';

const favButton = document.querySelector('.view-favorites');
const cookbookButton = document.querySelector('.view-cookbook');
const pantryButton = document.querySelector('.view-pantry');
const homeButton = document.querySelector('.home')
const cardArea = document.querySelector('.all-cards');
const searchInput = document.querySelector('.search-input');
const cookButton = document.querySelector('.cook-recipe');
let user, pantry, cookbook, ingredients;

const instantiateUser = (usersData) => {
  let userId = (Math.floor(Math.random() * 49) + 1);
  let newUser = usersData.find(user => {
    return user.id === Number(userId);
  });
  user = new User(userId, newUser.name, newUser.pantry);
  pantry = new Pantry(newUser.pantry);
}

const updateUserPantry = (currentUserId, allUsers) => {
  const activeUser = allUsers.find(user => user.id === currentUserId);
  pantry = new Pantry(activeUser.pantry)
}

const updateUserData = () => {
  fetch('http://localhost:3001/api/v1/users')
  .then(res => res.json())
  .then(data => updateUserPantry(user.id, data))
  .catch(err => domUpdates.showSuccessMessage('Oops! Something went wrong'));
}


const getData = () => {
  let usersPromise = fetch('http://localhost:3001/api/v1/users')
    .then(res => res.json());
  let recipesPromise = fetch('http://localhost:3001/api/v1/recipes')
    .then(res => res.json());
  let ingredientsPromise = fetch('http://localhost:3001/api/v1/ingredients')
    .then(res => res.json());

  Promise.all([usersPromise, recipesPromise, ingredientsPromise])
    .then(dataset => {
      instantiateUser(dataset[0]);
      cookbook = new Cookbook(dataset[1]);
      ingredients = dataset[2];
      domUpdates.greetUser(user);
      domUpdates.drawCards(cookbook.recipes, cardArea, user);
    }).catch(err => domUpdates.showSuccessMessage('Oops! Something went wrong'));
}

const postData = (ingredientToRemove) => {
  let body = {
    userID: +`${user.id}`,
    ingredientID: +`${ingredientToRemove.id}`,
    ingredientModification: -`${ingredientToRemove.amount}`
  };
  return fetch('http://localhost:3001/api/v1/users',
    {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
    }
  )
}

const onStartup = () => {
  getData();
}

const updatePantry = () => {
  let recipeId = document.querySelector('.ingredients').id;
  let recipeDisplayed = cookbook.recipes.find(recipe => +recipe.id === +recipeId);
  const currentRecipe = new Recipe(recipeDisplayed, ingredients);
  const itemsToRemove = pantry.findItemsToRemove(currentRecipe);
  Promise.all(itemsToRemove.map(item => postData(item)))
    .then(response => {
      return Promise.all(response.map(res => res.json()))
    })
    .then(data => {
      domUpdates.showSuccessMessage('Your pantry has been updated!')
      updateUserData();
    })
    .catch(err => domUpdates.showSuccessMessage('You don\'t have enough ingredients!'))
  domUpdates.hideCookButton();
}

const goToHome = () => {
  domUpdates.hideChefLogos();
  domUpdates.hideSuccessMessage();
  document.querySelector('.home-cl').classList.remove('hidden');
  document.querySelector('.error-message').innerText = '';
  domUpdates.drawCards(cookbook.recipes, cardArea, user);
  domUpdates.hideRecipeDetails();
  domUpdates.hideCookButton();
}

window.onload = onStartup();
homeButton.addEventListener('click', goToHome);
favButton.addEventListener('click', () => {
  domUpdates.changePage(event, user, user.favoriteRecipes, cardArea, pantry, ingredients)
});
cardArea.addEventListener('click', (event) => {
  domUpdates.cardButtonConditionals(user, cardArea, cookbook, event, ingredients, pantry)
});
cookbookButton.addEventListener('click', () => {
  domUpdates.changePage(event, user, user.recipesToCook, cardArea, pantry, ingredients);
});
searchInput.addEventListener('keyup', () => {
  domUpdates.searchRecipesByNameOrIngredient(user, searchInput.value, cookbook.recipes, ingredients, cardArea);
});
pantryButton.addEventListener('click', () => {
  domUpdates.changePage(event, user, pantry.contents, cardArea, pantry, ingredients)
});
cookButton.addEventListener('click', () => {
  updatePantry()
});
