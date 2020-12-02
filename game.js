class Game {
	constructor(){
		this.canvas = document.getElementById("myCanvas")
		this.ctx = this.canvas.getContext("2d")

		this.height = window.innerHeight - 20
		this.width = 2 * this.height / 3

		this.canvas.width = this.width
		this.canvas.height = this.height

		this.time = 10 //upate every x milliseconds
		this.g = 0.3 //gravity
		this.vx = 3 //speed

		this.pipe_gap = 180 //gap between upper and lower pipe
		this.pipes_separation = 200 //separation between pipe pairs
		
		this.gen = 0 //generation count
		this.averageFitness = 0 //the average fitness of the generation
		this.populationSize = 50
		this.population =  new Population(this.populationSize)
		
		this.drawing = new NetworkDrawing(this.width/2, 0, this.width/2, this.height/4, this.ctx)

		this.backgroundImage = new Image()
		this.backgroundImage.src = "background.png"
	}

	newGame(){
		//reset settings
		this.dx = -200 //position on the map
		this.pipes = []
		this.closestPipe = null //used for collision and input

		//each bird receives a network for decision making
		var birds = []
		for (var i = 0; i < this.populationSize; i++){
			var bird = new Bird(this.population.networks[i], this.height)
			bird.y += (Math.random() * 100) - 50
			birds.push(bird)
		}

		//set the position of the drawing
		this.bestBird = birds[0] //we show the bird that goes the farthers
		this.drawing.setPositions(this.bestBird.network)

		//set interval
		var t = this;
		this.interval = window.setInterval(function(){
			t.play(birds)
		}, this.time)
	}

	displayInfo(){
		this.ctx.fillStyle = "white"
		this.ctx.font = "30px Arial"
		
		var gen = "Gen: " + this.gen.toString()
		this.ctx.fillText(gen, 40, 80)

		var score = "Score: " + this.bestBird.network.fitness.toString() 
		this.ctx.fillText(score, 40, 120)

		var average = "Average: " + this.averageFitness.toString()
		this.ctx.fillText(average, 40, 160)
	}

	getInputs(birdX, birdY){
		if (this.closestPipe != null){
			var x = (this.closestPipe.x - birdX) / this.width
			//var y1 = (birdY - this.closestPipe.y1) / this.height
			//var y2 = (birdY - this.closestPipe.y2) / this.height
			var middle = (this.closestPipe.y1 + this.closestPipe.y2) / 2
			var y = (middle - birdY) / this.height
		} else {
			var x = this.pipes_separation / this.width
			//var y1 = (birdY) / this.height
			//var y2 = (birdY - this.height) / this.height
			var middle = this.height / 2
			var y = (middle - birdY) / this.height
		}
		return [x, y]
	}

	checkBirdsCollision(birds){
		//check collision
		for (var i = 0; i < birds.length; i++){
			if (birds[i].alive && this.closestPipe != null){
				var collided = this.closestPipe.doesCollid(birds[i])
				birds[i].alive = !collided //alive if not collided
			}
		}
	}

	updateBestBird(birds){
		//find a new best bird
		var i = -1
		while (i < birds.length - 1){
			i++
			if (birds[i].alive){
				break
			}
		}

		//set this as new best bird
		this.bestBird = birds[i]

		//create the position for the drawing
		if (this.bestBird != null){
			this.drawing.setPositions(this.bestBird.network)
		} else {
			console.log(birds)
			console.log(i)
			console.log(this.bestBird)
		}
		
	}

	updatePipeLimit(){
		//adds pipe
		if (this.dx % this.pipes_separation == 0){
			var pipe = new PipePair(this.dx + this.width, this.height, this.pipe_gap)
			this.pipes.push(pipe)
		}

		//remove if it goes out of the screen on the left
		if (this.pipes.length > 0 && !this.pipes[0].isOnMap(this.dx)){
			this.pipes.shift()
		}
	}

	updateClosestPipe(){
		//update closest pipe
		if (this.closestPipe != null){
			//check if we passed the pipe
			if ((this.closestPipe.x + this.closestPipe.width + this.bestBird.r) <= this.bestBird.x){
				//we choose the next pipe as closest Pipe
				var index = this.pipes.indexOf(this.closestPipe)
				this.closestPipe = this.pipes[index + 1]
			}
		} else if (this.pipes[0] != null){
			//current pipe is assigned to the first pipe
			this.closestPipe = this.pipes[0]
		}
	}

	updateBirds(birds){
		var alive = false
		var fitnessSum = 0
		for (var i = 0; i < birds.length; i++){
			if (birds[i].alive){
				var [x, y] = this.getInputs(birds[i].x, birds[i].y)
				birds[i].think(x, y)
				birds[i].move(this.vx, this.g)
				birds[i].draw(this.dx, this.ctx)
				alive = true //there are still birds alive
			} else if (birds[i] == this.bestBird) {
				//if the best bird dies we find a new one
				this.updateBestBird(birds)
			}
			fitnessSum += birds[i].network.fitness
		}
		this.averageFitness = parseInt(fitnessSum / birds.length)
		//this.bestBird.drawBest(this.dx, this.ctx)
		return alive
	}

	drawPipes(){
		for (var i = 0; i < this.pipes.length; i++){
			this.pipes[i].draw(this.dx, this.ctx)
		}
		if (this.closestPipe != null){
			//this.closestPipe.drawBest(this.dx, this.ctx)
		}
		
	}

	play (birds){
		this.dx += this.vx
		this.updatePipeLimit()
		this.updateClosestPipe()
		this.drawBackground()
		this.checkBirdsCollision(birds)
		var alive = this.updateBirds(birds)
		this.drawPipes()
		this.drawing.drawNetwork(this.bestBird.network)
		this.displayInfo()

		if (!alive){
			this.death()
		}
	}

	death(){
		console.log("death")
		clearInterval(this.interval)

		this.population.split()
		this.population.select()
		this.gen++
		console.log(this.population)
		
		this.newGame()
	}

	drawBackground(){
		// this.ctx.fillStyle = "#8cb1ed"
		// this.ctx.rect(0, 0, this.width, this.height)
		// this.ctx.fill()
		this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height)
	}
}
