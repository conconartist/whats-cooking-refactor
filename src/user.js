class User {
  constructor(id, name, pantry) {
    this.id = id;
    this.name = name;
    this.pantry = pantry;
    this.favoriteRecipes = [];
    this.recipesToCook = [];
  }

  saveRecipe(recipe, category) {
    if (!this[category].includes(recipe)) {
      this[category].push(recipe)
    }
  }

  removeRecipe(recipe, category) {
    const i = this[category].indexOf(recipe);
    this[category].splice(i, 1)
  }

  filterFavorites(tag) {
    return this.favoriteRecipes.filter(recipe => {
      return recipe.tags.includes(tag);
    });
  }

  findRecipes(stringToSearch, recipes, category) {
    let matchingRecipesByName = recipes.filter(recipe => {
      return recipe.name.toLowerCase().includes(stringToSearch.toLowerCase())
    })
    if (category !== '') {
      let recipesStored = this[category].map(item => +item.id);
      const matchingRecipesOnPage = matchingRecipesByName.filter(recipe => {
        return recipesStored.includes(recipe.id)
      })
      return matchingRecipesOnPage
    }
    return matchingRecipesByName
  }

}

export default User;
