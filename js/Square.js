define(function(){
	function Square(grid, columns, rows, index){
		
		var	instance = this,
			claimedBy,
			corner,
			edge,
			container;

		//	DEBUG
		this.debugIndex = index;
		
		this.init = function(){
			var instance = this;

			container = $('<span>');

			//	DEBUG
			container.html('<strong>' + index + '</strong>');
			
			container = addClasses(container);
				
			grid.getContainer().append(container);

			function addClasses(container){
				container.addClass('square');
				if(grid.indexIsWest(index)){
					container.addClass('west');
				}
				return container;
			};
		};

		this.destroy = function(){
			container.remove();
		};

		this.getIndex = function(){
			return index;
		};

		this.getCoords = function(){
			return {
				x: (index - 1)%columns + 1,
				y: Math.floor((index - 1)/columns) + 1
			};
		};

		this.isCorner = function(){
			var cornerSquares =[];

			if(corner === undefined){
				corner = false;
				cornerSquares = grid.getCorners();
				for(var i = 0; i < cornerSquares.length; i++){
					if(cornerSquares[i] === this){
						corner = true;
						break;
					};
				};
			};
			return corner;
		};

		this.isEdge = function(){
			var edgeSquares = [];

			if(edge === undefined){
				edge = false;
				edgeSquares = grid.getEdges();
				for(var i = 0; i < edgeSquares.length; i++){
					if(edgeSquares[i] === this){
						edge = true;
						break;
					};
				};	
			};
			return edge;
		};

		this.getContainer = function(){
			return container;
		};

		this.getAllAdjacent = function(){
			var columns = grid.getSize().columns;

			return {
				NW: getAdjacent('NW'),
				N: 	getAdjacent('N'),
				NE: getAdjacent('NE'),
				W: 	getAdjacent('W'),
				E: 	getAdjacent('E'),
				SW: getAdjacent('SW'),
				S: 	getAdjacent('S'),
				SE: getAdjacent('SE')
			};
		};

		this.describe = function(){
			console.log(container);
			console.log('index: ', index);
			console.log('claimedBy: ', claimedBy);
			console.log('corner: ', this.isCorner());
			console.log('edge: ', this.isEdge());
			console.log('getAllAdjacent: ', this.getAllAdjacent());
		};

		this.highlight = function(){
			container.addClass('active');
		};

		/**
		* @param {string} player PLAYER_1 : PLAYER_2
		* @param {boolean} isPaintMode bypass captures
		**/
		this.claim = function(player, isPaintMode){
			var isPaintMode = isPaintMode || false;

			if(claimedBy !== undefined && !isPaintMode){
				this.describe();
				console.log(player + ' tried to claim this, but it is already owned', claimedBy);
				$.error('This is already claimed.');
				return;
			};
			claimedBy = player;

			if(isPaintMode === false){
				grid.captureSquares(index, player);
			};
			updateUI();		

			function updateUI(){
				showNewClaim(container);

				//	remove hints
				$('.available').removeClass('available');
			};
		};

		function showNewClaim(container){
			//	show new claim
			container
				.removeClass(PLAYER_1)
				.removeClass(PLAYER_2)
				.addClass(claimedBy);
		};

		this.getClaimedBy = function(){
			return claimedBy;
		};

		this.findAlly = function(direction, allyClaim, isFirstNeighbor){
			var neighbor = getAdjacent(direction),
				allyClaim  = allyClaim || claimedBy,
				neighborClaim;

			if(neighbor !== undefined){
				neighborClaim = neighbor.getClaimedBy();
			};

			if(isFirstNeighbor === undefined){
				isFirstNeighbor = true;
			};

			if(neighbor === undefined || neighborClaim === undefined){
				return;
			} else if(neighborClaim === allyClaim && isFirstNeighbor){
				return;
			} else if(neighborClaim === allyClaim){
				return neighbor;
			} else {
				return neighbor.findAlly(direction, allyClaim, false);
			};
		};

		this.capture = function(){
			if(claimedBy === PLAYER_1 ){
				claimedBy = PLAYER_2;
			} else {
				claimedBy = PLAYER_1;
			};

			showNewClaim(container);
			
			return true;
		};

		function getAdjacent(direction){
			var isN,
				isS,
				isW,
				isE,
				adjacentIndex;

			if(instance.isEdge()){
				isN = grid.indexIsNorth(index);
				isS = grid.indexIsSouth(index);
				isW = grid.indexIsWest(index);
				isE = grid.indexIsEast(index);
			};

			switch(direction){
				case 'NW':
					adjacentIndex = isN || isW ? undefined : index - columns - 1;
					break;
				case 'N':
					adjacentIndex = isN ? undefined : index - columns;
					break;
				case 'NE':
					adjacentIndex = isN || isE ? undefined : index - columns + 1;
					break;
				case 'W':
					adjacentIndex = isW ? undefined : index - 1;
					break;
				case 'E':
					adjacentIndex = isE ? undefined : index + 1;
					break;
				case 'SW':
					adjacentIndex = isS || isW ? undefined : index + columns -1;
					break;
				case 'S':
					adjacentIndex = isS ? undefined : index + columns;
					break;
				case 'SE':
					adjacentIndex = isS || isE? undefined : index + columns + 1;
					break;
			};

			return grid.getSquare(adjacentIndex);
		};
	};

	return {
		Square: Square
	};
});