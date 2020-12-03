//drawing values
var canvas
var ctx
var width
var height

var testNetwork //for testing

function init(){
	initCanvas()
}

function test(){
	var population = new Population(100)
	for (var i = 0; i < population.networks.length; i++){
		population.networks[i].addRandomConnection()
		population.networks[i].splitRandomConnection()
	}
	population.split()
	for (var i = 0; i < population.species.length; i++){
		console.log(population.species[i])
	}

	var net1 = population.species[0][0]
	var drawing1 = new NetworkDrawing(0, 0, width/2, height/2, ctx)
	drawing1.drawNetwork(net1)
	net1.fitness = Math.random()

	var net2 = population.species[1][0]
	var drawing2 = new NetworkDrawing(width/2, 0, width/2, height/2, ctx)
	drawing2.drawNetwork(net2)
	net2.fitness = Math.random()

	var net3 = population.species[2][0]
	var drawing3 = new NetworkDrawing(0, height/2, width/2, height/2, ctx)
	drawing3.drawNetwork(net3)
	net3.fitness = Math.random()

	var net4 = population.species[3][0]
	var drawing4 = new NetworkDrawing(width/2, height/2, width/2, height/2, ctx)
	drawing4.drawNetwork(net4)
	net4.fitness = Math.random()
}

function initCanvas(){
	canvas = document.getElementById("myCanvas")
	ctx = canvas.getContext("2d")
	
	//height = window.innerHeight - 20
	//width = 2 * height / 3
	width = window.innerWidth
	height = window.innerHeight

	//document.addEventListener('keypress', mutateTestNetwork);

	canvas.width = width
	canvas.height = height
}

function clearCanvas(){
	ctx.fillStyle = "white"
	ctx.rect(0, 0, width, height)
	ctx.fill()
}
