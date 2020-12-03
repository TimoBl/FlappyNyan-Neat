//a class used for drawing a network
class NetworkDrawing {
	constructor(x, y, w, h, ctx){
		this.x = x
		this.y = y
		this.width = w
		this.height = h
		this.ctx = ctx
		this.backgroundColor = "white"
		this.dx = -8 //text translation
		this.dy = 8 //text translation
		this.scale = 0.04
		this.r = this.scale * Math.sqrt(this.width * this.height)
	}

	clearDrawing(){
		this.ctx.fillStyle = this.backgroundColor
		this.ctx.rect(this.x, this.y, this.width, this.height)
		this.ctx.fill()
	}

	setPositions(network){
		//calculate node position for this network
		var sx = this.width / (network.hiddenNodes.length + 1 + 2)

		//input nodes 
		var x = sx
		var sy = this.height / (network.inputNodes.length + 1)
		for (var i = 0; i < network.inputNodes.length; i++){
			var y = sy * (i + 1)
			network.inputNodes[i].px = x //save without offset
			network.inputNodes[i].py = y //save without offset
		}

		//hidden nodes
		for (var i = 0; i < network.hiddenNodes.length; i++){
			var y = (this.height / 2) + ((2 * (i%2)) - 1) * this.height / 8
			var x = sx * (i + 2)
			network.hiddenNodes[i].px = x //save without offset
			network.hiddenNodes[i].py = y //save without offset
		}

		//output nodes
		var x = this.width - sx
		var sy = this.height / (network.outputNodes.length + 1)
		for (var i = 0; i < network.outputNodes.length; i++){
			var y = sy * (i + 1)
			network.outputNodes[i].px = x //save without offset
			network.outputNodes[i].py = y //save without offset
		}
	}

	drawNetwork(network){
		//draw input nodes
		for (var i = 0; i < network.inputNodes.length; i++){
			this.drawNode(network.inputNodes[i])
		}

		//draw the hidden nodes
		for (var i = 0; i < network.hiddenNodes.length; i++){
			this.drawNode(network.hiddenNodes[i])
		}

		//draw the output nodes
		for (var i = 0; i < network.outputNodes.length; i++){
			this.drawNode(network.outputNodes[i])
		}

		//draw the connections (genes)	
		this.ctx.strokeStyle = "red"																											
		for (var i = 0; i < network.genes.length; i++){
			if (network.genes[i] != null){
				this.drawGene(network.genes[i])
			}
		}
	}

	drawGene(gene){
		var inp = gene.inputNode 
		var out = gene.outputNode
		this.ctx.lineWidth = 5

		var dx = out.px - inp.px
		var dy = out.py - inp.py
		var d = Math.sqrt((dx * dx) + (dy * dy))
		var cx = this.r * dx / d
		var cy = this.r * dy / d

		//draw red if enabled and grey if disabled
		if (gene.enabled){
			this.ctx.strokeStyle = "red"
			this.ctx.font = "14px Arial"
			this.ctx.fillStyle = "black"
			//var w = parseInt(gene.weight.toString() * 100) / 100
			//var w = parseInt(gene.innovationNumber)
			//this.ctx.fillText(w, this.x + (inp.px + out.px)/2, this.y + (inp.py + out.py)/2 + 20)
		} else {
			this.ctx.strokeStyle = "grey"
		}

		this.ctx.globalAlpha = gene.weight //change transparency based on weight
		this.ctx.beginPath()
		this.ctx.moveTo(this.x + inp.px + cx, this.y + inp.py + cy)
		this.ctx.lineTo(this.x + out.px - cx, this.y + out.py - cy)
		this.ctx.stroke()
		this.ctx.globalAlpha = 1
	}

	drawNode(node){
		//draw the node as black circle
		this.ctx.fillStyle = "white"
		this.ctx.beginPath()
		this.ctx.arc(this.x + node.px, this.y + node.py, this.r, 0, 2 * Math.PI, false)
		this.ctx.fill()

		//draw node index
		this.ctx.font = "26px Arial"
		this.ctx.fillStyle = "white"
		//this.ctx.fillText(node.index.toString(), this.x + x + this.dx, this.y + y + this.dy)

		//draw node value
		this.ctx.font = "14px Arial"
		this.ctx.fillStyle = "white"
		var w = parseInt(node.value * 100) / 100
		this.ctx.fillText(w.toString(), this.x + node.px + this.r, this.y + node.py + this.r)
	}
}