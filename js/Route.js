define(function(){

	var grid;

	function init(g){
		grid = g;
	};

	function Route(destination, direction, player){
		/*	A Route is an empty square (destination) and a path of opponent-claimed squares leading to it.
		*	The entrance is a square opposite of the destination across the path.  This is the square that
		*	needs to be claimed by the player in order to next capture the destination.
		*
		*	If the path length is 0 or there is no entrance, there is no route established.
		*/

		var direction = -direction,
			path = [],
			entrance;	//	identified by getPath

		//	the destination must be unclaimed
		if(destination.getClaimedBy() === undefined){
			path = getPath(destination, direction, player);
		};

		function getPath(destination, direction, player){
			var path = [],
				thisSquare = destination,
				nextSquare,
				isPathSquare,
				opponent = grid.getOpponent(player);

			do{
				nextSquare = grid.getSquare(thisSquare.getIndex() + direction);
				isPathSquare = nextSquare !== undefined && nextSquare.getClaimedBy() === opponent;

				if(isPathSquare){
					path.push(nextSquare);
				} else if(path.length > 0 && nextSquare !== undefined){
					entrance = nextSquare;
				};
				thisSquare = nextSquare;
			} while( isPathSquare );

			return path;
		};

		this.getPath = function(){
			return path;
		};

		this.getEntrance = function(){
			return entrance;
		};
	};

	/**
	* @param {square} destination
	* @param {string} player
	* @return {object}
	**/
	function getAllRoutes(destination, player){
		var allRoutes = {
			NW: getRoute(destination, grid.NW, player),
			N: getRoute(destination, grid.N, player),
			NE: getRoute(destination, grid.NE, player),
			W: getRoute(destination, grid.W, player),
			E: getRoute(destination, grid.E, player),
			SW: getRoute(destination, grid.SW, player),
			S: getRoute(destination, grid.S, player),
			SE: getRoute(destination, grid.SE, player)
		};

		for(var direction in allRoutes){
			if(allRoutes[direction] === undefined){
				delete allRoutes[direction];
			};
		};

		return allRoutes;
	};

	/**
	*	Returns a valid route to a destination square.
	*	@param {square} destination
	*	@param {number} direction
	*	@player {string} player
	**/
	function getRoute(destination, direction, player){
		var route = new Route(destination, direction, player);
		if(route.getEntrance() !== undefined){
			return route;
		};
	};

	return {
		init: init,
		getAllRoutes: getAllRoutes,
		getRoute: getRoute
	};
});