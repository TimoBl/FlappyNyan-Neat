//the network
class Neat {
	constructor(population, numberOfInputNodes, numberOfOutputNodes){
		this.population = population //pointer to parent
		this.index = 0 //used for node index
		this.bias = true //does the network have a bias
		this.inputNodes = this.getInputNodes(numberOfInputNodes)
		this.hiddenNodes = [] //hidden nodes
		this.outputNodes = this.getOutputNodes(numberOfOutputNodes)
		this.genes = [] //the connections between nodes, innovation number is used as index
		this.maxInnovationNumber = 0 //the highest innovation number
		this.fitness = 0 //used for combination
		this.adjustedFitness = 0 //species use adjusted fitness
	}

	//get input nodes
	getInputNodes(numberOfInputNodes){
		var nodes = this.getNodes(numberOfInputNodes)
		if (this.bias){
			//has bias, so we add another input value 1 we don't change
			var node = new Node(this.index)
			node.value = 1
			this.index++
			nodes.push(node)
		}
		return nodes
	}

	//helper function for creating new nodes
	getNodes(numberOfNodes){
		var nodes = []
		for (var i = 0; i < numberOfNodes; i++){
			var node = new Node(this.index)
			nodes.push(node)
			this.index++
		}
		return nodes
	}

	//get output nodes
	getOutputNodes(numberOfOutputs){
		return this.getNodes(numberOfOutputs)
	}
	
	//mutates the genome
	mutate(){
		var changeWeight = 0.9
		var adjustWeight = 0.9

		var connectionProb = 0.05
		var splitingProb = 0.02
		var enable_disable = 0.04

		//weight mutation
		if (Math.random() <= changeWeight){
			if (Math.random() < adjustWeight){
				//adjust weight
				console.log("adjust weight")
				this.adjustRandomWeight()
			} else {
				//change weight
				console.log("change weight")
				this.changeRandomWeight()
			}
		}

		//structural mutation
		if (Math.random() <= connectionProb){
			console.log("add")
			this.addRandomConnection()
		} else if (Math.random() <= splitingProb){
			console.log("split")
			this.splitRandomConnection()
		}

		//functional mutation
		if (Math.random() <= enable_disable) {
			console.log("enable / disable")
			this.enable_disableMutation()
		} 
	}

	//enable or disable gene
	enable_disableMutation(){
		var i = Math.floor(Math.random() * this.genes.length)

		//we can only use an available gene
		if (this.genes[i] != null) {
			this.genes[i].enabled = !this.genes[i].enabled
		} else {
			this.enable_disableMutation()
		}
	}

	//change a random gene's weight slightly
	adjustRandomWeight(){
		var i = Math.floor(Math.random() * this.genes.length)

		//we can only use an available gene
		if (this.genes[i] != null){
			var value = ((Math.random() - 0.5) * 2 / 5) //between -0.2 and 0.2
			this.genes[i].weigth += value
		} else {
			this.adjustRandomWeight()
		}
	}

	//fully change a gene's weight
	changeRandomWeight(){
		var i = Math.floor(Math.random() * this.genes.length)

		//we can only use an available gene
		if (this.genes[i] != null){
			this.genes[i].weigth = (Math.random() * 2) - 1 //betwenn -1 and 1
		} else {
			this.changeRandomWeight()
		}
	}

	//adds a random connection
	addRandomConnection(){
		//the input node of the gene can be an inputNode or an outputNode
		var inputIndex = Math.floor(Math.random() * (this.inputNodes.length + this.hiddenNodes.length))
		
		if (inputIndex < this.inputNodes.length){
			//it's an inputNode
			var inp = this.inputNodes[inputIndex]
			inputIndex = -1
		} else {
			//it's a hiddenNode
			inputIndex -= this.inputNodes.length
			var inp = this.hiddenNodes[inputIndex]
		}
		
		//the output node of the gene can be hidden or an outputNode
		var lowerBoundary = inputIndex + 1
		var upperBoundary = this.hiddenNodes.length + this.outputNodes.length - lowerBoundary
		var outputIndex = Math.floor(Math.random() * (upperBoundary)) + lowerBoundary
		if (outputIndex < this.hiddenNodes.length){
			//it's a hiddenNode
			var out = this.hiddenNodes[outputIndex]
			outputIndex = -1
		} else {
			//it's an outputNode
			outputIndex -= this.hiddenNodes.length
			var out = this.outputNodes[outputIndex]
		}
		
		var innovationNumber = this.population.getInnovationNumber(inp.index, out.index)

		//check if already connected
		if (this.genes[innovationNumber] != null){
			//we have to find a new connection
			this.addRandomConnection()
		} else {
			//we can add the connection
			this.addConnection(inp, out)
		}
	}

	//split random connection
	splitRandomConnection(){
		//get a random gene
		var gene = this.genes[Math.floor(Math.random() * this.genes.length)]

		//we can only split a enabled connection
		if (gene != null && gene.enabled){
			this.splitConnection(gene)
		} else {
			this.splitRandomConnection()
		}
	}

	//add a new connection
	addConnection(inputNode, outputNode){
		var innovationNumber = this.population.getInnovationNumber(inputNode.index, outputNode.index)
		this.maxInnovationNumber = Math.max(this.maxInnovationNumber, innovationNumber) //sets biggest innovation number
		var gene = new Gene(inputNode, outputNode, innovationNumber)
		this.genes[innovationNumber] = gene //innovation number is used as index
	}

	//split the connection
	splitConnection(gene){
		var inp = gene.inputNode
		var out = gene.outputNode
		var weight = gene.weight
		gene.enabled = false

		//add new node
		var node = new Node(this.index)
		this.index++

		//the node position in the array is used for activation
		//so we have to make sure it's in the correct order
		var i = this.hiddenNodes.indexOf(out)
		if (i == -1){
			//is linked to output node, so add to the end
			this.hiddenNodes.push(node)
		} else {
			//the node is added before the next node for activation
			this.hiddenNodes.splice(i, 0, node)
		}

		//add connection to node
		this.addConnection(inp, node)
		this.genes[this.genes.length - 1].weight = 1 //has a weight of 1

		//add connection from node
		this.addConnection(node, out)
		this.genes[this.genes.length - 1].weight = weight //has the weight of the previous connection
	}

	//check if two nodes are connected
	areNodesConnected(inputNode, outputNode){
		for (var i = 0; i < this.genes.length; i++){
			var g = this.genes[i]
			if (g.inputNode == inputNode && g.outputNode == outputNode){
				return true
			}
		}
		return false
	}

	//helper function to get node with index
	getNode(index){
		//check in hidden nodes
		for (var i = 0; i < this.hiddenNodes.length; i++){
			if (this.hiddenNodes[i].index == index){
				return this.hiddenNodes[i]
			}
		}

		//check input nodes
		for (var i = 0; i < this.inputNodes.length; i++){
			if (this.inputNodes[i].index == index){
				return this.inputNodes[i]
			}
		}

		//check output nodes
		for (var i = 0; i < this.outputNodes.length; i++){
			if (this.outputNodes[i].index == index){
				return this.outputNodes[i]
			}
		}

		//not found
		return -1
	}

	//set the inputs as value of the input nodes
	setInput(inputs) {
		for (var i = 0; i < inputs.length; i++){
			this.inputNodes[i].value = inputs[i]
		}
	}

	//trigger node, sum connection to this neuron
	activate(node){	
		node.value = 0	//reset

		for (var i = 0; i < this.genes.length; i++){
			if (this.genes[i] != null && this.genes[i].enabled && this.genes[i].outputNode == node){
				//leads to this node so we add it
				node.value += this.genes[i].inputNode.value * this.genes[i].weight
			}
		}

		node.value = sigmoid(node.value)
	}

	//function to return output of network from an input
	getOutput(inputs){
		//set the inputs as value of input nodes
		this.setInput(inputs)

		//forward to every hidden node
		//because they are in forward order we can simply loop in normal order
		for (var i = 0; i < this.hiddenNodes.length; i++){
			this.activate(this.hiddenNodes[i])
		}

		//get ouputs and return them
		var outputs = []
		for (var i = 0; i < this.outputNodes.length; i++){
			this.activate(this.outputNodes[i])
			outputs.push(this.outputNodes[i].value)
		}
		return outputs
	}
}