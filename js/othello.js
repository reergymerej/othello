var debugMoves = '';
//debugMoves = '[{"claimedBy":"player1","index":30},{"claimedBy":"player2","index":38},{"claimedBy":"player1","index":46},{"claimedBy":"player2","index":39},{"claimedBy":"player1","index":45},{"claimedBy":"player2","index":22}]';

//	TODO stop cluttering global namespace
var PLAYER_1 = 'player1',
	PLAYER_2 = 'player2';



$(function(){

	require(['Game'], function(gameModule){

		showAiModes();

		function showAiModes(){
			var aiModes = gameModule.getAiModes();
			for(var i = 0; i < aiModes.length; i++){
				$('#p1AiMode, #p2AiMode').append(
					$('<option />', {value: aiModes[i]}).html(aiModes[i])
				);
			};
		};

		$('form').submit(function(){

			var gameOptions = {
				columns: parseInt($('#columns').val(), 10),
				rows: parseInt($('#rows').val(), 10),
				gamesToPlay: parseInt($('#gamesToPlay').val(), 10),
				playerOneIsHuman: $('#p1Species').val() === 'human',
				playerOneAiMode: $('#p1AiMode').val(),
				playerTwoIsHuman: $('#p2Species').val() === 'human',
				playerTwoAiMode: $('#p2AiMode').val()
			};

			console.log(gameOptions);

			$(this).hide();

			start(gameOptions);

			return false;
		});

		//	DEBUG
		$('#toggleIndices').click(function(){
			$('#grid strong').toggle();
			return false;
		});

		//	DEBUG
		$('#paintMode').click(function(){
			require(['Grid', 'AI'], function(gridModule, ai){
				var grid = new gridModule.Grid(8, 8);
				grid.init();

				var squares = grid.getSquares();
				for(var i = 0; i < squares.length; i++){
					squares[i].getContainer().click({square: squares[i]}, function(e){
						cycleClaim(e.data.square);
					});
				};
				
				ai.setGrid(grid);

				window.grid = grid;
				window.t = new ai.Test();
				
				function cycleClaim(square){
					var currentClaim = square.getClaimedBy(),
						claims = [undefined, PLAYER_1, PLAYER_2];
					square.claim(claims[claims.indexOf(currentClaim)%claims.length + 1], true);
				};

				$('#randomSpread').click();
			});
			return false;
		});

		//	DEBUG
		$('#randomSpread').click(function(){
			var squares = grid.getSquares(),
				claims = [undefined, PLAYER_1, PLAYER_2];
			for(var i = 0; i < squares.length; i++){
				squares[i].claim(claims[Math.floor(Math.random() * claims.length)], true);
			};
			return false;
		});

		function start(gameOptions){
			var game;
			var gameResults = {
				'player1':0,
				'player2':0,
				'tie':0
			};
			var gamesLeft = gameOptions.gamesToPlay;
			//	start the first game
			var startTime = Date.now();

			$('.' + PLAYER_1 + 'Wins, .' + PLAYER_2 + 'Wins ', '#score').data('wins', 0);
			
			loopThroughGames();

			function loopThroughGames(){
				if(gamesLeft > 0){
					gamesLeft--;

					//	delete the old game when the new one starts so we can look at the results
					if(game !== undefined){
						game.destroy();
						delete game;
					};

					game = new gameModule.Game(gameOptions);
					game.over(function(data){
						gameResults[data.winner]++;
						
						loopThroughGames();
					});

					try {
						game.startGame();				
					} catch(e){
						console.log(e, e.message, e.stack);
					};
				
				} else {
					$('#score')
						.clone()
						.dialog({
							title: 'Results',
							buttons: {
								OK: function(){
									$(this).dialog('close');
								}
							},
							beforeClose: function(){
								$('form').show();
								$(this).dialog('destroy');
							}
						});

					console.log('------------------------------------');
					console.log('test results');
					console.log('------------------------------------');
					console.log((gameResults.player1 / gameOptions.gamesToPlay) * 100 + '% - player1 (' + gameOptions.playerOneAiMode + ')');
					console.log((gameResults.player2 / gameOptions.gamesToPlay) * 100 + '% - player2 (' + gameOptions.playerTwoAiMode + ')');
					console.log((gameResults.tie / gameOptions.gamesToPlay) * 100 + '% - tied');
					console.log((Date.now() - startTime) / 1000 + ' seconds');
					console.log('------------------------------------');
				};
			};
		};	
	});
});