define(['Grid', 'AI'], function(gridModule, AI){
	function Game(gameOptions){
		var grid = new gridModule.Grid(gameOptions.columns, gameOptions.rows);
		var currentTurn = PLAYER_1;
		var move;
		var moveLog = [];
		var gameOverCallback;
		var waitingForMove = false;
		
		grid.getContainer().empty();

		AI.setGrid(grid);

		/**
		* Determine who goes next.
		* @return {string} PLAYER_1, PLAYER_2, undefined
		**/
		function getCurrentTurn(){
			var nextTurn = (currentTurn === PLAYER_1) ? PLAYER_2 : PLAYER_1; 

			//	does next guy have any moves?
			if(hasMoveAvailable(nextTurn)){
				return nextTurn;
			} else if(hasMoveAvailable(currentTurn)){
				return currentTurn;
			};

			function hasMoveAvailable(player){
				//	TODO pass these moves to the player to pick from rather than figuring them out again
				return grid.getAvailableMoves(player).length > 0;
			};
		};

		function gameOver(){

			var winner = getWinner(),
				winsTallyContainer = $('.' + winner + 'Wins', '#score'),
				winCount = parseInt(winsTallyContainer.data('wins'), 10) + 1;

			winsTallyContainer
				.data('wins', winCount)
				.html(winCount);

			gameOverCallback({
				winner: winner
			});
		};

		function getWinner(){
			var results = getTally(),
				winner;

			if(results[PLAYER_1] > results[PLAYER_2]){
				winner = PLAYER_1;
			} else if(results[PLAYER_2] > results[PLAYER_1]){
				winner = PLAYER_2;
			} else {
				winner = 'tie';
			};

			return winner;
		};

		function getTally(){
			var tally = {},
				claimedBy
				squares = grid.getSquares();

			tally[PLAYER_1] = 0;
			tally[PLAYER_2] = 0;

			for(var i = 0; i < squares.length; i++){
				claimedBy = squares[i].getClaimedBy();
				if(claimedBy !== undefined){
					tally[claimedBy]++;
				};
			};

			return tally;
		};
		
		this.startGame = function(){
			var interval,
				moveWait;

			grid.init();

			showScore();

			makeMove();

			if(gameOptions.playerOneIsHuman || gameOptions.playerTwoIsHuman){
				moveWait = 200;
			} else {
				moveWait = 0;
			};

			interval = setInterval(function(){

				//	next turn
				if(!waitingForMove){

					showScore();

					currentTurn = getCurrentTurn();

					//	finish game
					if(currentTurn === undefined){
						clearInterval(interval);
						gameOver();
						return;
					};

					makeMove();
				};
			}, moveWait);

			function showScore(){
				var tally = getTally();
				$('.' + PLAYER_1, '#score').html(tally[PLAYER_1]);
				$('.' + PLAYER_2, '#score').html(tally[PLAYER_2]);
			};

			function makeMove(){
				//	DEBUG
				if(window.kill === true){
					clearInterval(interval);
					gameOver();
				};

				var availableMoves;
				waitingForMove = true;

				//	human move
				if(currentTurn === PLAYER_1 && gameOptions.playerOneIsHuman
					|| currentTurn === PLAYER_2 && gameOptions.playerTwoIsHuman){
					
					availableMoves = grid.getAvailableMoves(currentTurn);

					//	listen for clicks
					$.each(availableMoves, function(i, square){
						var squareContainer = square.getContainer();
						
						squareContainer.click(function(){

							square.claim(currentTurn);
							waitingForMove = false;
						});
					});
				} else {

					//	AI move
					AI.move(getAiMode(currentTurn), currentTurn);
					waitingForMove = false;
				};

				function getAiMode(player){
					if(player === PLAYER_1){
						return gameOptions.playerOneAiMode;
					} else {
						return gameOptions.playerTwoAiMode;
					};
				};
			};
		};

		this.destroy = function(){
			grid.destroy();
			delete grid;
		};

		this.over = function(callback){
			gameOverCallback = callback;
		};
	};

	return {
		Game: Game,

		getAiModes: function(){
			return AI.getModes();
		}
	};
});