if (typeof require === 'function') {
    var Clickomania = require("./engine").Clickomania;
}

var playfield = new Clickomania.Playfield(15,15);
var game = new Clickomania.Game(playfield);
game.fillPlayfield();

var runAiFunctionUntilGameEnds = function(aiFunction) {
    // define a new inner function so we can use parameters when calling recursively
    // without passing them explicitly
    var removeBlockUsingAi = function() {
	// TODO when game receives a click it should automatically update the game state
	// the canvasView should also listen to gameChanged events and redraw automatically
	if (game.hasMoreMoves()) {
	    var blockColRow = aiFunction(game.immutableView);
	    if (typeof blockColRow === 'undefined') {
		console.log("ai function returned undefined and will be terminated");
	    } else {
		var blocksRemoved = game.click(blockColRow[0], blockColRow[1]);
		if (blocksRemoved === 0) {
		    console.log("AI algorithm chose an invalid location (col: " + blockColRow[0] + ", row: "+ blockColRow[1] + ") and will be terminated");
		} else if (typeof setTimeout === 'function') {
		    setTimeout(removeBlockUsingAi, 20);
		} else {
		    removeBlockUsingAi();
		}
	    }
	}
    };
    removeBlockUsingAi();
}

var clickLikeAMadman = function(gameView) {
    var rowIndex = gameView.rows - 1;
    var columnIndex = gameView.columns - 1;
    while (rowIndex >= 0) {
	while (columnIndex >= 0) {
	    if (typeof gameView.getBlock(columnIndex, rowIndex) !== 'undefined') {
		var connectedBlocks = gameView.getConnectedBlocks(columnIndex, rowIndex);
		if (connectedBlocks.length > 1) {
		    return [columnIndex, rowIndex];
		    //clickChangedPlayField = this.click(columnIndex, rowIndex);
		}
	    }
	    columnIndex -= 1;
	}
	columnIndex = gameView.columns - 1;
	rowIndex -= 1;
    }
};

runAiFunctionUntilGameEnds(clickLikeAMadman);
