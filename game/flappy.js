class Bird {
	constructor(network, height){
		//position
		this.x = 0
		this.y = height / 2
		this.height = height
		this.vy = 0
		this.r = 30
		this.j = -6
		this.canvasHeight = height
		this.network = network
		this.alive = true
		this.image = new Image()
		this.image.src = "assets/nyancat.png"
		//this.vx = 0
		this.trail = []
		this.trailHeightColor = 10
	}

	think(x, y){
		//x distance to the pipe pair
		//y height difference to the pipe pair middle
		//vy vertical speed
		var inputs = [x, y, this.vy/10]
		var outputs = this.network.getOutput(inputs)
		if (outputs[0] > 0.5){
			this.flap()
		}
	}

	move(vx, g){
		this.x += vx
		this.network.fitness = this.x
		this.fall(g)
		this.limit()
		//this.trail.push([this.x, this.y])
	}

	limit(){
		//limit top
		if (this.y < 0){
			this.y = 0
			this.vy = 0
			this.alive = false
		}

		//limit bottom
		if (this.y > this.height){
			this.y = this.height
			this.vy = 0
			this.alive = false
		}
	}

	fall(g){
		this.y += this.vy
		this.vy += g
	}

	draw(dx, ctx){
		//this.drawTrail(dx, ctx)
		ctx.drawImage(this.image, this.x - dx - this.r, this.y-this.r, 2*this.r, 2*this.r);
	}

	drawTrail(dx, ctx){
		for (var i = 0; i < this.trail.length; i++){
			var x = this.trail[i][0] - dx
			var y = this.trail[i][1]
			
			ctx.fillStyle = "#db1616"
			ctx.fillRect(x, y - 3 * this.trailHeightColor, 3, this.trailHeightColor)

			ctx.fillStyle = "#e69e05"
			ctx.fillRect(x, y - 2 * this.trailHeightColor, 3, this.trailHeightColor)

			ctx.fillStyle = "#edea4a"
			ctx.fillRect(x, y - this.trailHeightColor, 3, this.trailHeightColor)

			ctx.fillStyle = "#2df026"
			ctx.fillRect(x, y, 3, this.trailHeightColor)

			ctx.fillStyle = "#1e8de3"
			ctx.fillRect(x, y + 1 * this.trailHeightColor, 3, this.trailHeightColor)

			ctx.fillStyle = "#481d8a"
			ctx.fillRect(x, y + 2 * this.trailHeightColor, 3, this.trailHeightColor)
		}
	}

	drawCircle(dx, ctx){
		ctx.fillStyle = "#f7e754"
		ctx.beginPath()
		ctx.arc(this.x - dx, this.y, this.r, 0, 2 * Math.PI)
		ctx.fill()
	}

	drawBest(dx, ctx){
		ctx.fillStyle = "red"
		ctx.beginPath()
		ctx.arc(this.x - dx, this.y, this.r, 0, 2 * Math.PI)
		ctx.fill()
	}

	flap(){
		this.vy = this.j
	}
}

class PipePair {
	constructor(x, height, pipe_gap){
		this.x = x
		
		this.y1 = Math.round(Math.random() * (height - pipe_gap))
		this.y2 = this.y1 + pipe_gap

		this.width = 120
		this.height = height

		this.pipeTopImage = new Image()
		this.pipeTopImage.src = "assets/pipeTop.png" //120x1600

		this.pipeBottomImage = new Image()
		this.pipeBottomImage.src = "assets/pipeBottom.png"  //120x1600
	}

	doesCollid(bird){
		//https://yal.cc/rectangle-circle-intersection-test/
		var dx = bird.x - Math.max(this.x, Math.min(bird.x, this.x + this.width))
		
		var dy1 = bird.y - Math.max(0, Math.min(bird.y, this.y1))
		var dy2 = bird.y - Math.max(this.y2, Math.min(bird.y, this.height))

		var b1 = ((dx * dx) + (dy1 * dy1)) < (bird.r * bird.r)
		var b2 = ((dx * dx) + (dy2 * dy2)) < (bird.r * bird.r)

		if (b1 || b2){
			//collision 
			console.log("collided")
			return true
		} else {
			//no collision
			return false
		}
	}

	isOnMap(dx){
		if (this.x + this.width - dx < 0){
			return false
		} else {
			return true
		}
	}

	draw(dx, ctx){
		//draw top pipe
		ctx.drawImage(this.pipeTopImage, this.x - dx, this.y1 - 2133, this.width, 2133)

		//draw bottom pipe
		ctx.drawImage(this.pipeBottomImage, this.x - dx, this.y2, this.width, 2133)
	}

	draw2(dx, ctx){
		ctx.fillStyle = "#20b347"

		//upper block
		ctx.beginPath()
		ctx.rect(this.x - dx, 0, this.width, this.y1)
		ctx.fill()

		//lower block
		ctx.beginPath()
		ctx.rect(this.x - dx, this.y2, this.width, this.height - this.y2)
		ctx.fill()
	}

	drawBest(dx, ctx){
		ctx.fillStyle = "red"

		//upper block
		ctx.beginPath()
		ctx.rect(this.x - dx, 0, this.width, this.y1)
		ctx.fill()

		//lower block
		ctx.beginPath()
		ctx.rect(this.x - dx, this.y2, this.width, this.height - this.y2)
		ctx.fill()
	}
}

