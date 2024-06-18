var dots;
var ab = new ArrayBuffer(100);
var i8 = new Int8Array(200);
Array.prototype.getClosestN = function( n ){
	var arr = this.sortOn("dist").slice(0, n);
	return arr;
}

Array.prototype.sortOn = function(key){
    this.sort(function(a, b){
        if(a[key] < b[key]){
            return -1;
        }else if(a[key] > b[key]){
            return 1;
        }
        return 0;
    });
    return this;
}

function Node(value) {
    this.value = value;
    this.children = [];
    this.parent = null;

    this.setParentNode = function(node) {
        this.parent = node;
    }

    this.getParentNode = function() {
        return this.parent;
    }

    this.addChild = function(node) {
        node.setParentNode(this);
        this.children[this.children.length] = node;
    }

    this.getChildren = function() {
        return this.children;
    }

    this.removeChildren = function() {
        this.children = [];
    }
}

function getTree(refPtArr, lvl, nodeArr){
	var pointArr = dots[lvl-1], nearest;
	if(typeof pointArr !== "undefined"){
		pointArr = pointArr.array;

		for(var h = 0; h < nodeArr.length; h++){
			currNode = nodeArr[h];
			for(var j = 0; j < refPtArr.length; j++){	
				var refPt = refPtArr[j];
				for(var i = 0; i < pointArr.length; i++){
					var currDot = pointArr[i];
					currDot.dist = getDistance(refPt, currDot);						
				}
			}
			if(lvl == 1 || lvl == 2){
				nearest = pointArr.filter(function(x){ return !x.inserted}).getClosestN(1);
			}else{
				nearest = pointArr.filter(function(x){ return !x.inserted}).getClosestN(getRandomBetween(2, 5));
			}
			for(var i = 0; i < nearest.length; i++){
				nearest[i].inserted = true;
				nearest[i].id = "l_" + getRandomBetween(0, 25000);
				currNode.addChild(new Node(nearest[i]))
			}						
			getTree(nearest, lvl + 1, currNode.getChildren())
		}
	}else{
		//console.log("Tree Made")
		return;
	}
}

function getDistance(p1, p2){
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getRandomBetween(min, max){
	return Math.floor(Math.random()*(max-min+1)+min);
}

self.addEventListener('message', function(e) {
	dots = e.data.dots;
	root = new Node(e.data.refPt);
	getTree([e.data.refPt], 1, [root]);
	var cache = [], result = "";
	result = JSON.stringify(root, function(key, value) {
	    if (typeof value === 'object' && value !== null) {
	        if (cache.indexOf(value) !== -1) {
	            // Circular reference found, discard key
	            return;
	        }
	        // Store value in our collection
	        cache.push(value);
	    }
	    return value;
	});
	cache = null;
  	self.postMessage({result:JSON.parse(result)});
}, false);