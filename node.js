//the node of the network
class Node {
	constructor(index){
		this.index = index  //index in network
		this.value = 0		//the value that is passed on

		this.px = 0	//used for drawing
		this.py = 0	//used for drawing
	}

	//reset node value for each new input
	reset(){
		this.value = 0
	}
}

