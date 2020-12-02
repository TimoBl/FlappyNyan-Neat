function sigmoid(x){
	var c = -1 //can be used to change activation
	return 1 / (1 + Math.exp(c * x))
}

function init(){
	//new game
	var game = new Game()
	game.newGame()
}