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
	if (game.hasMoreMoves()) {
	    var blockColRow = aiFunction(game.immutableView);
	    if (typeof blockColRow === 'undefined') {
		console.log("ai function returned undefined and will be terminated");
	    } else {
		var blocksRemoved = game.click(blockColRow[0], blockColRow[1]);
		if (blocksRemoved === 0) {
		    console.log("AI algorithm chose an invalid location (col: " + blockColRow[0] + ", row: "+ blockColRow[1] + ") and will be terminated");
		} else if (typeof setTimeout === 'function') {
		    setTimeout(removeBlockUsingAi, 1);
		} else {
		    removeBlockUsingAi();
		}
	    }
	}
    };
    removeBlockUsingAi();
}

var clickLikeABigMan = function(gameView) {
    var connectedBlocks, maxColumnIndex, maxRowIndex, maxConnectedBlocksCount = 0;
    var columnIndex, rowIndex;
    for (columnIndex = 0; columnIndex < gameView.columns; columnIndex++) {
	for (rowIndex = 0; rowIndex < gameView.rows; rowIndex++) {
	    connectedBlocks = gameView.getConnectedBlocks(columnIndex, rowIndex);
	    if(connectedBlocks.length > maxConnectedBlocksCount) {
		maxConnectedBlocksCount = connectedBlocks.length;
		maxColumnIndex = columnIndex;
		maxRowIndex = rowIndex;
	    }
	}
    }
    return [maxColumnIndex, maxRowIndex];
};

var clickLikeAMadman = function(gameView) {
    var rowIndex = gameView.rows - 1;
    var columnIndex = gameView.columns - 1;
    while (rowIndex >= 0) {
	while (columnIndex >= 0) {
	    if (typeof gameView.getBlock(columnIndex, rowIndex) !== 'undefined') {
		var connectedBlocks = gameView.getConnectedBlocks(columnIndex, rowIndex);
		if (connectedBlocks.length > 1) {
		    return [columnIndex, rowIndex];
		}
	    }
	    columnIndex -= 1;
	}
	columnIndex = gameView.columns - 1;
	rowIndex -= 1;
    }
};

var clickLikeAnUpperMadMan = function() {
    var rowIndex = 0
    var columnIndex = 0
    while (rowIndex < this.playfield.rows) {
	while (columnIndex < this.playfield.columns) {
	    if (typeof this.playfield.getBlock(columnIndex, rowIndex) !== 'undefined') {
		var connectedBlocks = gameView.getConnectedBlocks(columnIndex, rowIndex);
		if (connectedBlocks.length > 1) {
		    return [columnIndex, rowIndex];
		}
	    }
	    columnIndex += 1;
	}
	columnIndex = 0;
	rowIndex += 1;
    }
};

//Game.prototype.clickLikeAJedMan = function(columnIndex, rowIndex) {
    //function timeNewRound(columnIndex, rowIndex){
	//if (this.hasMoreMoves()) {
	    //setTimeout(this.clickLikeAJedMan.bind(this, columnIndex, rowIndex), 50);
	//} else {
	    //console.log("'Couldn't find any more moves so I'll stop', said Jed");
	//}
    //};
    //var clickChangedPlayField = false;
    //while (!clickChangedPlayField && rowIndex >= 0) {
	//while (!clickChangedPlayField && columnIndex >= 0) {
	    //if (typeof this.playfield.getBlock(columnIndex, rowIndex) !== 'undefined') {
		//clickChangedPlayField = this.click(columnIndex, rowIndex);
		//if(clickChangedPlayField) {
		    //canvas.drawPlayfield();
		    //timeNewRound.call(this, columnIndex, rowIndex);
		    //return;
		//}
	    //}
	    //columnIndex -= 1;
	//}
	//columnIndex = this.playfield.columns - 1;
	//rowIndex -= 1;
    //}
    //timeNewRound.call(this, this.playfield.columns - 1, this.playfield.rows - 1);
//};
