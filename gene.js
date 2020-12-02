//the connection between nodes
class Gene {
	constructor(inputNode, outputNode, innovationNumber){
		this.inputNode = inputNode
		this.outputNode = outputNode
		this.weight = (Math.random() * 2) - 1 //betwenn -1 and 1
		//this.weight = Math.random()
		this.enabled = true //we can disable nodes
		this.innovationNumber = innovationNumber //used to combine networks
	}

	//take the value of the input node, multiply it with the weight and add it to node 
	forward(){
		this.outputNode.value += (this.inputNode.value * this.weight)
	}
}

