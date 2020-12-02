//the population of every networks
class Population {
	constructor(size) {
		this.numberOfInputs = 4
		this.numberOfOutputs = 1
		this.populationSize = size

		//list of genes (as tuple) to keep track of innovation number
		this.genes = []

		//list of every network in population
		this.networks = this.getRandomNetworks()

		//the population is split up into species, an array of networks
		this.species = [] 
	}

	//split into species
	split(){
		var threshold = 0.5 //used to split into population
		this.resetSpecies()

		for (var i = 0; i < this.populationSize; i++){
			var net1 = this.networks[i]

			//loop through species
			//if genetic distance is smaller than the threshold
			//we can add it to the species, else create new species
			var placed = false
			var index = 0
			while (!placed && index < this.species.length){
				var net2 = this.species[index][0]
				if (this.compare(net1, net2) <= threshold){
					//we found a compatible species
					placed = true
					this.species[index].push(net1)
				}
				index++
			}

			if (!placed){
				//create new species
				this.species.push([net1])
			}
		}

		//let's calculate the adjusted fitness
		this.adjustFitness()
	}

	//we make a new generation of networks
	select(){
		this.orderByFitness()

		//kill the bottom half
		var sep = parseInt(this.networks.length / 2)
		var len = this.networks.length - sep
		this.networks.splice(sep, len)

		//repopulation through cloning, randomness and crossover
		var networks = []

		//clone top 5%
		var top = parseInt(0.05 * this.populationSize)
		for (var i = 0; i < top; i++){
			var net = this.networks[i]
			networks.push(net)
			this.networks.splice(0, 1)
		}

		//randomly choose 25%
		var middle = parseInt(0.25 * this.populationSize)
		for (var i = 0; i < middle; i++){
			var index = Math.floor(Math.random() * this.networks.length)
			var net = this.networks[index]
			networks.push(net)
			this.networks.splice(index, 1)
		}

		//crossover the rest
		var bottom = this.populationSize - top - middle
		for (var i = 0; i < bottom; i++){
			var index1 = Math.floor(Math.random() * this.networks.length)
			var index2 = Math.floor(Math.random() * this.networks.length)
			var parent1 = this.networks[index1]
			var parent2 = this.networks[index2]
			var child = this.joinNetworks(parent1, parent2)
			networks.push(child)
		}

		//mutate every network before assigning
		for (var i = 0; i < this.populationSize; i++){
			networks[i].mutate()
		}

		this.networks = networks
	}

	//helper function to order networks by fitness
	orderByFitness(){
		this.networks.sort((a, b) => {
			return (b.adjustedFitness - a.adjustedFitness)
		})
	}

	//helper function to calculate adjusted fitness
	adjustFitness(){
		//divide fitness of network by number of networks in species
		for (var i = 0; i < this.species.length; i++){
			var l = this.species[i].length
			for (var j = 0; j < l; j++){
				var network = this.species[i][j]
				network.adjustedFitness = network.fitness / l
			}
		}
	}

	//helper function to reset species
	resetSpecies(){
		//for each species we choose one network randomly
		//we will use it to compare to other networks 
		for (var i = 0; i < this.species.length; i++){
			var index = Math.floor(Math.random() * this.species[i].length)
			var network = this.species[i][index]
			this.species[i] = [network]
		}
	}

	//helper function to get networks
	getRandomNetworks(){
		var networks = []
		for (var i = 0; i < this.populationSize; i++){
			var n = new Neat(this, this.numberOfInputs, this.numberOfOutputs)
			n.addRandomConnection()
			networks.push(n)
		}
		return networks
	}

	//check gene with the rest of the population and give innovation number
	getInnovationNumber(inputIndex, outputIndex){
		//try to find inovation number
		var i = 0
		
		while (i < this.genes.length){
			var gene = this.genes[i]
			if (gene.inputIndex == inputIndex && gene.outputIndex == outputIndex){
				//gene is found, return innovation number
				return gene.innovationNumber
			}
			i++
		}

		//no matching gene so create a new gene
		var innovationNumber = this.genes.length
		var newGene = {inputIndex: inputIndex, outputIndex: outputIndex, innovationNumber: innovationNumber}
		this.genes.push(newGene)

		return innovationNumber
	}

	//we now join networks
	joinNetworks(parent1, parent2){
		//generate the child network
		var child = new Neat(this, this.numberOfInputs, this.numberOfOutputs)

		//parent 1 has a higher fitness than parent 2
		if (parent1.fitness > parent2.fitness){
			var p1 = parent1
			var p2 = parent2
		} else {
			var p1 = parent2
			var p2 = parent1
		}

		//copy the nodes of the fiter parent
		for (var i = 0; i < p1.hiddenNodes.length; i++){
			var index = p1.hiddenNodes[i].index
			var n = new Node(index)
			child.hiddenNodes.push(n)
		}

		//matching genes
		for (var i = 0; i <= p1.genes.length; i++){
			if (p1.genes[i] != null && p2.genes[i] != null){
				//matching so we choose a random
				if (Math.random() >= 0.5){
					var inputIndex = p1.genes[i].inputNode.index
					var outputIndex = p1.genes[i].outputNode.index
					var weight = p1.genes[i].weight
					var enabled = p1.genes[i].enabled
				} else {
					var inputIndex = p2.genes[i].inputNode.index
					var outputIndex = p2.genes[i].outputNode.index
					var weight = p2.genes[i].weight
					var enabled = p2.genes[i].enabled
				}

				//get the nodes
				var inputNode = child.getNode(inputIndex)
				var outputNode = child.getNode(outputIndex)
				var innovationNumber = this.getInnovationNumber(inputIndex, outputIndex)
				child.maxInnovationNumber = Math.max(child.maxInnovationNumber, innovationNumber)

				//get the gene and add it
				var gene = new Gene(inputNode, outputNode, innovationNumber)
				gene.weight = weight
				gene.enabled = enabled
				child.genes[innovationNumber] = gene
			} else if (p1.genes[i] != null){
				//disjoint from p1, so we still add them
				var inputIndex = p1.genes[i].inputNode.index
				var outputIndex = p1.genes[i].outputNode.index

				//get the nodes
				var inputNode = child.getNode(inputIndex)
				var outputNode = child.getNode(outputIndex)
				var innovationNumber = this.getInnovationNumber(inputIndex, outputIndex)
				child.maxInnovationNumber = Math.max(child.maxInnovationNumber, innovationNumber)

				//get the gene and add it
				var gene = new Gene(inputNode, outputNode, innovationNumber)
				gene.weight = p1.genes[i].weight
				gene.enabled = p1.genes[i].enabled
				child.genes[innovationNumber] = gene
			} else if (p2.genes[i] != null) {
				//we don't add genes from the ess fitter parent
			}
		}
		return child
	}

	//compare network to get genetic difference
	compare(net1, net2){
		//we need three different values
		var e = 0	//number of excess genes
		var d = 0	//number of disjoint genes
		var deltaW = 0	//sum of the difference of matching weight
		var w = 0	//number of matching weight
		var N = 1   //can be used for normalization of larger genomes

		//we can use three constant to adjust comparison
		const c1 = 1
		const c2 = 1
		const c3 = 1

		var t = Math.min(net1.maxInnovationNumber, net2.maxInnovationNumber) //threshold for excess
		//console.log("P1: " + net1.fitness + ", P2: " + net2.fitness)
		for (var i = 0; i < Math.max(net1.maxInnovationNumber, net2.maxInnovationNumber); i++){
			if (net1.genes[i] != null && net2.genes[i] != null){
				//it's a matching gene
				//console.log(i + " is matching")
				deltaW += Math.abs(net2.genes[i].weight - net1.genes[i].weight)
				w += 1
			} else if (net1.genes[i] != null || net2.genes[i] != null){
				//it's either disjoint or excess
				if (i > t){
					//it's an excess
					//console.log(i + " is excess")
					e += 1
				} else {
					//it's an disjoint
					//console.log(i + " is disjoint")
					d += 1
				}
			}
		}
		
		//get differnece
		if (w != 0){
			var delta = (c1 * e / N) + (c2 * d / N) + c3 * deltaW / w
		}
		else {
			//can't divide by 0!
			var delta = (c1 * e / N) + (c2 * d / N)
		}
		
		return delta
	}
}

