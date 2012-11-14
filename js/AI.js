define(['Route'], function(routeModule){

	var grid,
		availableMoves;

	function random(player){
		var choice = Math.floor(Math.random() * availableMoves.length);
		availableMoves[choice].claim(player);	
	};

	function randomCornerPreference(player){
		var includesCorner,
			choice;

		//	if one of these is a corner, choose it
		for(var i = 0; i < availableMoves.length; i++){
			if(availableMoves[i].isCorner()){
				choice = i;
				break;
			};
		};

		if(choice !== undefined){
			availableMoves[choice].claim(player);
		} else {
			random(player);
		};
	};

	function randomCornerPreferenceRouter(player){
		var includesCorner,
			choice,
			routesToCorners;

		//	if one of these is a corner, choose it
		for(var i = 0; i < availableMoves.length; i++){
			if(availableMoves[i].isCorner()){
				choice = i;
				break;
			};
		};

		//	Is there a route available to a corner?
		if(choice === undefined){
			routesToCorners = getRoutesToCorners(player);
			for(var i = 0; i < routesToCorners.length; i++){
				for(var direction in routesToCorners[i]){
					console.log('>>>', routesToCorners[i][direction].getEntrance());
					console.log(isSquareInAvailableMoves(routesToCorners[i][direction].getEntrance()));
					if(isSquareInAvailableMoves(routesToCorners[i][direction].getEntrance())){
						routesToCorners[i][direction].getEntrance().claim(player);
						return;
					};
				};
				if(choice !== undefined){
					//	TODO consider comparing available routes/corners
					//	to find the most preferable
					break;
				};
			};
		};

		if(choice !== undefined){
			availableMoves[choice].claim(player);
		} else {
			random(player);
		};

		function getRoutesToCorners(player){
			var corners = grid.getCorners(),
				cornerRoutes = [];

			for(var i = 0; i < corners.length; i++){
				cornerRoutes.push(routeModule.getAllRoutes(corners[i], player))
			};

			return cornerRoutes;
		};
	};

	function randomCornerEdge(player){
		var includesCorner,
			choice;

		//	check for corners
		for(var i = 0; i < availableMoves.length; i++){
			if(availableMoves[i].isCorner()){
				choice = i;
				break;
			};
		};

		//	check for edges
		if(choice === undefined){
			for(var i = 0; i < availableMoves.length; i++){
				if(availableMoves[i].isEdge()){
					choice = i;
					break;
				};
			};			
		};

		if(choice !== undefined){
			availableMoves[choice].claim(player);
		} else {
			random(player);
		};
	};

	function first(player){
		availableMoves[0].claim(player);	
	};

	function last(player){
		availableMoves[availableMoves.length - 1].claim(player);	
	};

	/**
	* Claim the square that captures the most of the opponent's squares.
	**/
	function vindictive(player){

		//	get all the opponent's available moves
		var availableMoves = grid.getAvailableMoves(player),
			potentialCaptures = [];
		
		for(var i = 0; i < availableMoves.length; i++){
			potentialCaptures.push(grid.getPotentialCaptures(availableMoves[i].getIndex(), player));
		};

		//	potentialCaptures is an array of other arrays.
		//	Each child array is full of objects describing what squares will be captured (square, array of captures squares, and ally square)
		potentialCaptures.sort(function(a, b){
			
			var capturedSquaresCountA = 0,
				capturedSquaresCountB = 0;
			
			for(var i = 0; i < a.length; i++){
				capturedSquaresCountA += a[i].captures.length;
			};

			for(var i = 0; i < b.length; i++){
				capturedSquaresCountB += b[i].captures.length;
			};

			//	sort descending
			if(capturedSquaresCountA > capturedSquaresCountB){
				return -1;
			} else if(capturedSquaresCountA < capturedSquaresCountB){
				return 1;
			} else {
				return 0;
			}
		});

		//	find the move that will result in the most captures
		potentialCaptures[0][0].square.claim(player);
	};

	/**
	* Capture the square that is threatening the most of this player's squares.
	* @param {boolean} defensive If true, capture the available square before the opponent does.
	*	If false, capture the threatening opponent square.
	**/
	function protectMasses(player, defensive){
		var choice,
			opponent = grid.getOpponent(player);

		console.log('defensive boolean is not accounted for yet');

		//	get all the opponent's available moves
		var opponentMoves = grid.getAvailableMoves(opponent);

		//	determine which is threatening the most of this player's squares
		var potentialCaptures = [];
		
		for(var i = 0; i < opponentMoves.length; i++){
			potentialCaptures.push(grid.getPotentialCaptures(opponentMoves[i].getIndex(), opponent));
		};

		//	potentialCaptures is an array of other arrays.
		//	Each child array is full of objects describing what squares will be captured (square, array of captures squares, and ally square)
		potentialCaptures.sort(function(a, b){
			
			var capturedSquaresCountA = 0,
				capturedSquaresCountB = 0;
			
			for(var i = 0; i < a.length; i++){
				capturedSquaresCountA += a[i].captures.length;
			};

			for(var i = 0; i < b.length; i++){
				capturedSquaresCountB += b[i].captures.length;
			};

			//	sort descending
			if(capturedSquaresCountA > capturedSquaresCountB){
				return -1;
			} else if(capturedSquaresCountA < capturedSquaresCountB){
				return 1;
			} else {
				return 0;
			}
		});

		//	see if we can capture the threat instead
		if(!defensive){

		};

		if(defensive){
			
			//	Filter the potential captures to those that have availableSquare we can capture first.
			for(var i = 0; i < potentialCaptures.length; i++){
				if(!isSquareInAvailableMoves(potentialCaptures[i][0].square)){
					potentialCaptures.splice(i, 1);
					i--;
				};
			};
		} else {
			console.log('continue here');
		};
		

		//	If any are left, claim the top.
		if(potentialCaptures.length > 0){
			potentialCaptures[0][0].square.claim(player);
			return;
		};

		random(player);
	};

	function isSquareInAvailableMoves(square){
		for(var i = 0; i < availableMoves.length; i++){
			if(availableMoves[i] === square){
				return true;
			};
		};
		return false;
	};

	function Test(){
		this.getStrongCorner = function(player){
			var corners = grid.getCorners();
			for(var i = 0; i < corners.length; i++){
				if(corners[i].getClaimedBy() !== player){
					corners.splice(i, 1);
					i--;
				};
			};
			return corners;
		};
	};
	
	return {
		getModes: function(){
			return [
				'random',
				'first',
				'last',
				'random (corner preference)',
				'randomCornerPreferenceRouter',
				'random (corner + edge)',
				'vindictive',
				'protect masses (defensive)'
			];
		},

		setGrid: function(g){
			grid = g;
			routeModule.init(grid);
		},

		move: function(logicPattern, player){
			availableMoves = grid.getAvailableMoves(player);
			
			switch(logicPattern){
				case 'first':
					first(player);
					break;
				case 'last':
					last(player);
					break;
				case 'random (corner preference)':
					randomCornerPreference(player);
					break;
				case 'randomCornerPreferenceRouter':
					randomCornerPreferenceRouter(player);
					break;
				case 'random (corner + edge)':
					randomCornerEdge(player);
					break;
				case 'vindictive':
					vindictive(player);
					break;
				case 'protect masses (defensive)':
					protectMasses(player, true);
					break;
				default:
					random(player);
					break;
			};
		},

		Test: function(){

			return new Test();
		}
	};
});