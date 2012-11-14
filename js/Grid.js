define(['Square'], function(squareModule){
	function Grid(columns, rows){

		var instance = this,
			squares = [],
			edges = [],
			CONTAINER = $('#grid'),
			NW, N, NE, W, E, SW, S, SE;

		if(columns%2 !== 0 || rows%2 !== 0){
			$.error('rows and columns must even numbers (' + columns + ', ' + rows + ')');
			return;
		};

		defineDirections();

		//	create squares
		for(var x = 0; x < columns; x++){
			for(var y = 0; y < rows; y++){
				squares.push(new squareModule.Square(this, columns, rows, x * rows + y + 1));
			};
		};

		function defineDirections(){
			NW = -columns - 1;
			N = -columns;
			NE = -columns + 1;
			W = -1;
			E = 1;
			SW = columns - 1;
			S = columns;
			SE = columns + 1;
		};

		this.init = function(){

			//	initialize squares
			for(var i = 0; i < squares.length; i++){
				squares[i].init();
			};

			//	claim starting squares
			initalClaim();

			function initalClaim(){
				var indices = getStartingIndicies();

				instance.getSquare(indices.a).claim(PLAYER_1);
				instance.getSquare(indices.b).claim(PLAYER_2);
				instance.getSquare(indices.c).claim(PLAYER_2);
				instance.getSquare(indices.d).claim(PLAYER_1);

				function getStartingIndicies(){
					var a = .5 * columns + .5 * rows * columns - columns,
						c = a + columns;
					return {
						a: a,
						b: a + 1,
						c: c,
						d: c + 1
					};
				};
			};
		};

		this.getSquares = function(){
			return squares;
		};

		this.getCorners = function(){
			return [
				squares[0],
				squares[columns - 1],
				squares[columns * rows - columns],
				squares[columns * rows - 1]
				];
		};

		this.getEdges = function(){
			var index;

			if(edges.length === 0){
				for(var i = 0; i < squares.length; i++){
					index = squares[i].getIndex();
					if(this.indexIsNorth(index)
						|| this.indexIsWest(index)
						|| this.indexIsEast(index)
						|| this.indexIsSouth(index)){
						edges.push(squares[i]);
					};
				};
			};

			return edges;
		};

		/**
		*	Get the squares along the inside of the edges.
		*	@return {array}
		**/
		this.getInnerRing = function(){
			var innerRing = [],
				coords = {};
			
			for(var i = 0; i < squares.length; i++){
				coords = squares[i].getCoords();
				
				if(coords.y === 1 || coords.y === rows || coords.x === 1 || coords.x === columns){
					continue;
				};

				if( (coords.x === 2 || coords.x === columns - 1)
					|| (coords.y === 2 || coords.y === rows - 1) ){
					squares[i].highlight();
					innerRing.push(squares[i]);
				};
			};

			return innerRing;
		};

		this.getSize = function(){
			return {
				columns: columns,
				rows: rows
			}
		};

		this.indexIsNorth = function(index){
			return index <= columns;
		};

		this.indexIsSouth = function(index){
			return index > columns * rows - columns;
		};

		this.indexIsWest = function(index){
			return index%columns === 1;
		};

		this.indexIsEast = function(index){
			return index%columns === 0;
		};

		this.getContainer = function(){
			return CONTAINER;
		};

		this.getSquare = function(index){
			return squares[index - 1];
		};

		this.captureSquares = function(claimedIndex, debugCurrentTurn){
			
			var square = this.getSquare(claimedIndex),
				allies = {
					NW: square.findAlly('NW'),
					N: square.findAlly('N'),
					NE: square.findAlly('NE'),
					W: square.findAlly('W'),
					E: square.findAlly('E'),
					SW: square.findAlly('SW'),
					S: square.findAlly('S'),
					SE: square.findAlly('SE'),
				},
				captured = [];

			for(var direction in allies){
				if(allies[direction] !== undefined){
					captured = getSquaresBetween(square, allies[direction], direction);
					//	DEBUG is this where the bug is happening?
					for(var i in captured){
						captured[i].capture();
					};
				};
			};
		};

		//	TODO consider merging this with capture and add boolean to capture or not
		/**
		* @return {array} objects with squares that would be captured if claimedIndex were claimed by player
		* 	and the allies that could allow for the capture
		**/
		this.getPotentialCaptures = function(claimedIndex, player){
			var square = this.getSquare(claimedIndex),
				allies = {
					NW: square.findAlly('NW', player),
					N: square.findAlly('N', player),
					NE: square.findAlly('NE', player),
					W: square.findAlly('W', player),
					E: square.findAlly('E', player),
					SW: square.findAlly('SW', player),
					S: square.findAlly('S', player),
					SE: square.findAlly('SE', player),
				},
				potentialCaptures = [];

			for(var direction in allies){
				if(allies[direction] !== undefined){

					potentialCaptures.push({
						captures: getSquaresBetween(square, allies[direction], direction),
						ally: allies[direction],
						square: square
					});
				};
			};

			return potentialCaptures;
		};

		this.handleError = function(data){
			console.log('ERROR: ', data);
			console.log(data.error.stack);
			console.log(JSON.stringify(moveLog));
		};

		this.destroy = function(){
			for(var i = squares.length - 1; i >= 0; i--){
				squares[i].destroy();
				delete squares[i];
			};
			delete squares;
		};

		this.NW = NW;
		this.N = N;
		this.NE = NE;
		this.W = W;
		this.E = E;
		this.SW = SW;
		this.S = S;
		this.SE = SE;

		function getOpponent(player){
			return (player === PLAYER_1) ? PLAYER_2 : PLAYER_1;
		};

		function getSquaresBetween(squareA, squareB, direction){
			var a = squareA.getIndex(),
				b = squareB.getIndex(),
				squaresBetween = [],
				interval = getSquareInterval(direction),
				currentIndex = a + interval;

			while(currentIndex !== b){
				squaresBetween.push(instance.getSquare(currentIndex));
				currentIndex += interval;
			};

			return squaresBetween;

			function getSquareInterval(direction){
				var interval = 0;

				if(direction.indexOf('N') !== -1){
					interval -= columns;
				};
				if(direction.indexOf('S') !== -1){
					interval += columns;
				};
				if(direction.indexOf('W') !== -1){
					interval --;
				};
				if(direction.indexOf('E') !== -1){
					interval ++;
				};

				return interval;
			};
		};

		/**
		*	@param {string} player PLAYER_1 or PLAYER_2
		*	@param {boolean} [markAsThreatened]
		*	@return {array} of Squares
		**/
		function getAvailableMoves(player, markAsThreatened){
			var thisAlly,
				allAllies = {},
				availableMoves = [],
				DIRECTIONS = ['NW', 'N', 'NE', 'W', 'E', 'SW', 'S', 'SE'],
				classToAdd = markAsThreatened ? 'threatened' : 'available';

			for(var i = 0; i < squares.length; i++){
				squares[i].getContainer()
					.removeClass(classToAdd);

				//	ignore squares already claimed
				if(squares[i].getClaimedBy() !== undefined){
					continue;
				};

				for(var j = 0; j < DIRECTIONS.length; j++){
					thisAlly = squares[i].findAlly(DIRECTIONS[j], player);

					if(thisAlly !== undefined){
						allAllies[thisAlly.getIndex()] = thisAlly;
						availableMoves.push(squares[i]);

						break;
					};
				};
			};

			//	show available squares
			for(var i = 0; i < availableMoves.length; i++){
				availableMoves[i].getContainer()
					.addClass(classToAdd);
			};

			//	show moves threatened
			if(!markAsThreatened){
				getAvailableMoves(getOpponent(player), true);
			};

			return availableMoves;
		};

		//	this method is needed internally and externally, or is it?
		this.getAvailableMoves = getAvailableMoves;

		this.getOpponent = getOpponent;
	};

	return {
		Grid: Grid
	};
});