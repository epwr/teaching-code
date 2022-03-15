
const recipes = [
    {
        name: "Recipe #1",
        steps: "Step 1: Make Bread."
    },
    {
        name: "Recipe #2",
        steps: "Step 1: Cook a Stew."
    },
    {
        name: "Recipe #3",
        steps: "Step 1: Something else."
    },
];


const showRecipe = (recipeIndex) => {

    var recipe = recipes(recipeIndex);

    var nameNode = document.createElement('h4');
    nameNode.innerText = recipe.name;
    


}
