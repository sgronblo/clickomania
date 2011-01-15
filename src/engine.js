if (typeof Function.prototype.bind === 'undefined') {
    Function.prototype.bind = function() {
	var boundFunction = this;
	var functionArgs = Array.prototype.slice.call(arguments);
	var thisObject = functionArgs.shift();
	return function() {
	    var combinedArgs = functionArgs.concat(Array.prototype.slice.call(arguments));
	    return boundFunction.apply(thisObject, combinedArgs);
	};
    };
}

StringUtilities = {
    startsWith: function(string, prefix) {
	return string.lastIndexOf(prefix, 0) === 0;
    },
    sprintf: function(formatString) {
	var outerValues = arguments;
	var replaceValue = function(match) {
	    var valueIndex = match.substr(1);
	    return outerValues[valueIndex];
	}
	return formatString.replace(/%\d+/g, replaceValue);
    }
};

var Clickomania = (function() {
    Playfield = function(columns, rows) {
	this.columns = columns;
	this.rows = rows;
	this.column;
	this.blocks = [];
	for (column = 0; column < this.columns; column++) {
	    this.blocks[column] = [];
	}
	this.clear();
	this.counter = 0;
    };

    Playfield.fromAscii = function() {
	//assert all rows are the same length
	var firstRowLength = arguments[0].length;
	var argumentAmount = arguments.length;
	var rowString;
	var rowLength;
	var rowIndex;
	var columnIndex;
	var newPlayfield = new Playfield(firstRowLength, argumentAmount);
	var type;
	for (rowIndex = 0; rowIndex < argumentAmount; rowIndex += 1) {
	    rowString = arguments[rowIndex];
	    rowLength = rowString.length;
	    for (columnIndex = 0; columnIndex < rowLength; columnIndex += 1) {
		type = rowString[columnIndex];
		if (type !== ' ') {
		    var newBlock = new Block(rowString[columnIndex]);
		    newPlayfield.putBlock(columnIndex, rowIndex, newBlock);
		}
	    }
	}
	return newPlayfield;
    };

    Playfield.prototype.fillWithBlocks = function(numBlockType) {
	var column, row, newBlock, randomBlockType;
	for (column = 0; column < this.columns; column += 1) {
	    for (row = 0; row < this.rows; row += 1) {
		randomBlockType = Math.floor(Math.random() * numBlockType);
		newBlock = new Block(randomBlockType);
		this.putBlock(column, row, newBlock);
	    }
	}
    };

    Playfield.prototype.getBlock = function(column, row) {
	var block;
	block = this.blocks[column][row];
	if (block === undefined) {
	    return block;
	}
	block.column = column;
	block.row = row;
	return block;
    };

    Playfield.prototype.getRowString = function(row) {
	var col, rowString = "[", block;
	    for (col = 0; col < this.columns; col++) {
		block = this.getBlock(col, row);
		if (typeof block !== "undefined") {
		    rowString += block.type;
		} else {
		    rowString += " ";
		}
	    }
	    return rowString + "]";
    };

    Playfield.prototype.putBlock = function(column, row, block) {
	this.blocks[column][row] = block;
    };

    Playfield.prototype.clear = function() {
	var column, row;
	for (column = 0; column < this.columns; column++) {
	    for (row = 0; row < this.rows; row++) {
		this.blocks[column][row] = undefined;
	    }
	}
    };

    Playfield.prototype.removeBlock = function(column, row) {
	var block = this.blocks[column][row];
	this.blocks[column][row] = undefined;
	return block;
    };

    Playfield.prototype.getNeighbours = function(column, row) {
	var previousRow, previousColumn, nextColumn, nextRow, neighbours = [];
	previousRow = row - 1;
	previousColumn = column - 1;
	nextColumn = column + 1;
	nextRow = row + 1;
	if (previousRow >= 0) {
	    neighbours.push(this.getBlock(column, previousRow));
	}
	if (previousColumn >= 0) {
	    neighbours.push(this.getBlock(previousColumn, row));
	}
	if (nextColumn < this.columns) {
	    neighbours.push(this.getBlock(nextColumn, row));
	}
	if (nextRow < this.rows) {
	    neighbours.push(this.getBlock(column, nextRow));
	}
	return neighbours;
    };

    Playfield.prototype.getConnectedBlocks = function(column, row) {
	this.counter += 1;
	var connectedBlocks = this.getConnectedBlocks_(column, row, this.counter);
	return connectedBlocks;
    };

    Playfield.prototype.getConnectedBlocks_ = function(column, row, counter) {
	var block, neighbours, connected = [], this_ = this;
	block = this.getBlock(column, row);
	if (typeof block === 'undefined') {
	    return [];
	}
	block.roundCounter = counter;
	connected.push(block);
	neighbours = this.getNeighbours(column, row);
	neighbours.forEach(function(neighbour) {
	    if (typeof neighbour !== 'undefined' && (neighbour.type === block.type && neighbour.roundCounter < counter)) {
		connected = connected.concat(this_.getConnectedBlocks_(neighbour.column, neighbour.row, counter));
	    }
	});
	return connected;
    };

    Playfield.prototype.compactAndCenter = function() {
	var columnsWithBlocks = this.getColumnsWithBlocks();
	var columnsWithoutBlocks = ArrayUtilies.complement(this.blocks, columnsWithBlocks);
	var emptyColumnAmount = columnsWithoutBlocks.length;
	var left = Math.ceil(emptyColumnAmount / 2);
	var right = this.columns - 1 - (emptyColumnAmount - left);
	var columnIndex;
	for(columnIndex = 0; columnIndex < this.columns; columnIndex += 1) {
	    if(columnIndex < left || columnIndex > right) {
		this.blocks[columnIndex] = columnsWithoutBlocks.shift();
	    } else {
		this.blocks[columnIndex] = columnsWithBlocks.shift();
	    }
	}
    };

    Playfield.prototype.clearColumn = function(column) {
	var rowIndex;
	for (rowIndex = 0; rowIndex < this.rows; rowIndex++) {
	    this.removeBlock(column, rowIndex);
	}
    };

    Playfield.prototype.getColumnsWithBlocks = function() {
	var column;
	var columnsWithBlocks = [];
	for (column = 0; column < this.columns; column++) {
	    if (this.columnHasBlocks(column)) {
		columnsWithBlocks.push(this.blocks[column]);
	    }
	}
	return columnsWithBlocks;
    };

    Playfield.prototype.columnHasBlocks = function(columnIndex) {
	var rowIndex;
	for (rowIndex = 0; rowIndex < this.rows; rowIndex++) {
	    if (typeof this.getBlock(columnIndex, rowIndex) !== "undefined") {
		return true;
	    }
	}
	return false;
    };

    Playfield.prototype.getBlocksLeft = function() {
	var columnIndex;
	var rowIndex;
	var blockAmount = 0;
	for (columnIndex = 0; columnIndex < this.columns; columnIndex++) {
	    for (rowIndex = 0; rowIndex < this.rows; rowIndex++) {
		if (typeof this.getBlock(columnIndex, rowIndex) !== 'undefined') {
		    blockAmount += 1;
		}
	    }
	}
	return blockAmount;
    };

    Block = function(type) {
	this.type = type;
	this.roundCounter = 0;
    };

    Game = function(playfield) {
	this.playfield = playfield;
	this.listeners = [];
	this.immutableView = {
	    columns: this.playfield.columns,
	    rows: this.playfield.rows,
	    getConnectedBlocks: this.playfield.getConnectedBlocks.bind(playfield),
	    getBlock: this.playfield.getBlock.bind(playfield)
	};
    };

    Game.prototype.click = function(column, row) {
	var removedBlocksCount = this.removeConnectedBlocks(column, row);
	this.advanceState();
	this.notifyListeners();
	return removedBlocksCount > 0;
    };

    Game.prototype.notifyListeners = function() {
	this.listeners.forEach(function(listener) {
	    listener.gameChanged();
	});
    };

    Game.prototype.getBlocksLeft = function() {
	return this.playfield.getBlocksLeft();
    };

    Game.prototype.fillPlayfield = function() {
	this.playfield.fillWithBlocks(10);
    };

    Game.prototype.removeConnectedBlocks = function(column, row) {
	var connectedBlocks, this_ = this;
	connectedBlocks = this.playfield.getConnectedBlocks(column, row);
	if (connectedBlocks.length > 1) {
	    connectedBlocks.forEach(function(block) {
		this_.playfield.removeBlock(block.column, block.row);
	    });
	    return connectedBlocks.length;
	}
	return 0;
    };

    Game.prototype.registerEventListener = function(listener) {
	this.listeners.push(listener);
    };

    Game.prototype.dropColumn = function(column) {
	// the row on which the next found block should be added
	var pileTopIndex;
	var rowIndex = this.playfield.rows - 1;
	var blockToMove;
	var columnHadGaps = false;
	while (!columnHadGaps && rowIndex >= 0) {
	    blockToMove = this.playfield.getBlock(column, rowIndex);
	    if (typeof blockToMove === 'undefined') {
		columnHadGaps = true;
		pileTopIndex = rowIndex;
	    }
	    rowIndex -= 1;
	}
	if (!columnHadGaps) {
	    return false;
	}
	// loop through rows upwards
	for (rowIndex; rowIndex >= 0; rowIndex--) {
	    blockToMove = this.playfield.getBlock(column, rowIndex);
	    if (typeof blockToMove !== 'undefined') {
		this.playfield.putBlock(column, pileTopIndex, new Block(blockToMove.type));
		this.playfield.removeBlock(column, rowIndex);
		pileTopIndex -= 1;
	    }
	}
	return true;
    };

    Game.prototype.dropBlocks = function() {
	var columnIndex;
	var dropped, test;
	for (columnIndex = 0; columnIndex < this.playfield.columns; columnIndex++) {
	    test = this.dropColumn(columnIndex);
	    if (dropped === false && test === true) {
		dropped === true;
	    }
	}
	return true;
    };

    Game.prototype.autoPlay = function(likeWho) {
	if (this.hasMoreMoves()) {
	    if(likeWho === 'Jed') {
		this.clickLikeAJedMan(this.playfield.columns - 1, this.playfield.rows - 1);
	    } else if (likeWho === 'UpperMad') {
		this.clickLikeAnUpperMadMan();
	    } else {
		this.clickLikeAMadman();
	    }
	}
    };

    Game.prototype.advanceState = function() {
	this.dropBlocks();
	this.playfield.compactAndCenter();
    }

    Game.prototype.clickLikeAnUpperMadMan = function() {
	var rowIndex = 0
	var columnIndex = 0
	var clickChangedPlayField = false;
	while (!clickChangedPlayField && rowIndex < this.playfield.rows) {
	    while (!clickChangedPlayField && columnIndex < this.playfield.columns) {
		if (typeof this.playfield.getBlock(columnIndex, rowIndex) !== 'undefined') {
		    clickChangedPlayField = this.click(columnIndex, rowIndex);
		}
		columnIndex += 1;
	    }
	    columnIndex = 0;
	    rowIndex += 1;
	}
	canvas.drawPlayfield();
	if (this.hasMoreMoves()) {
	    setTimeout(this.clickLikeAMadman.bind(this), 50);
	} else {
	    console.log("couldn't find any more moves so I'll stop");
	}
    };

    Game.prototype.clickLikeAMadman = function() {
	var rowIndex = this.playfield.rows - 1;
	var columnIndex = this.playfield.columns - 1;
	var clickChangedPlayField = false;
	while (!clickChangedPlayField && rowIndex >= 0) {
	    while (!clickChangedPlayField && columnIndex >= 0) {
		if (typeof this.playfield.getBlock(columnIndex, rowIndex) !== 'undefined') {
		    clickChangedPlayField = this.click(columnIndex, rowIndex);
		}
		columnIndex -= 1;
	    }
	    columnIndex = this.playfield.columns - 1;
	    rowIndex -= 1;
	}
	canvas.drawPlayfield();
	if (this.hasMoreMoves()) {
	    setTimeout(this.clickLikeAMadman.bind(this), 50);
	} else {
	    console.log("couldn't find any more moves so I'll stop");
	}
    };

    Game.prototype.clickLikeAJedMan = function(columnIndex, rowIndex) {
	function timeNewRound(columnIndex, rowIndex){
	    if (this.hasMoreMoves()) {
		setTimeout(this.clickLikeAJedMan.bind(this, columnIndex, rowIndex), 50);
	    } else {
		console.log("'Couldn't find any more moves so I'll stop', said Jed");
	    }
	};
	var clickChangedPlayField = false;
	while (!clickChangedPlayField && rowIndex >= 0) {
	    while (!clickChangedPlayField && columnIndex >= 0) {
		if (typeof this.playfield.getBlock(columnIndex, rowIndex) !== 'undefined') {
		    clickChangedPlayField = this.click(columnIndex, rowIndex);
		    if(clickChangedPlayField) {
			canvas.drawPlayfield();
			timeNewRound.call(this, columnIndex, rowIndex);
			return;
		    }
		}
		columnIndex -= 1;
	    }
	    columnIndex = this.playfield.columns - 1;
	    rowIndex -= 1;
	}
	timeNewRound.call(this, this.playfield.columns - 1, this.playfield.rows - 1);
    };

    Game.prototype.hasMoreMoves = function() {
	var connectedBlocks;
	var columnIndex;
	var rowIndex;
	var block;
	var column;
	for (columnIndex = 0; columnIndex < this.playfield.columns; columnIndex++) {
	    for (rowIndex = 0; rowIndex < this.playfield.rows; rowIndex++) {
		connectedBlocks = this.playfield.getConnectedBlocks(columnIndex, rowIndex);
		if (connectedBlocks.length > 1) {
		    return true;
		}
	    }
	}
	return false;
    };

    AsciiView = function(game) {
	this.game = game;
    };

    AsciiView.prototype.drawPlayfield = function(playfieldId) {
	var playfieldElement, column, row;
	playfieldElement = $(playfieldId);
	for (column = 0; column < playfield.columns; column++) {
	    for (row = 0; row < playfield.rows; row++) {
		playfieldElement.append(block.type);
	    }
	    playfieldElement.append('<br>');
	}
    };

    ArrayUtilies = {};

    ArrayUtilies.complement = function complement(all, some) {
	var elementsNotInSome = [];
	var allIndex, someIndex;
	var found;
	for(allIndex = 0; allIndex < all.length; allIndex += 1) {
	    found = false;
	    for(someIndex = 0; someIndex < some.length; someIndex +=1) {
		if(all[allIndex] === some[someIndex]) {
		    found = true;
		}
	    }
	    if(!found) {
		elementsNotInSome.push(all[allIndex]);
	    }
	}
	return elementsNotInSome;
    };

    CanvasUtilities = {
	coordinatesToCell: function(x, y, blockWidth, blockHeight) {
	    var column = Math.floor(x / blockWidth);
	    var row = Math.floor(y / blockHeight);
	    return [column, row];
	},
	getUpperLeftForCell: function(columnIndex, rowIndex, blockWidth, blockHeight) {
	    var upperLeft, lowerRight;
	    upperLeft = [columnIndex * blockHeight, rowIndex * blockWidth]
	    return upperLeft;
	},
	worldsCrappiestHashFunction: function(number) {
	    var i;
	    var temp = number;
	    for(i = 1; i <= 10; i++) {
		temp *= 37;
	    }
	    return temp;
	}
    };


    CanvasView = function(width, height, canvas, game) {
	this.width = width;
	this.height = height;
	this.game = game;
	this.canvas = canvas;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	this.canvas.addEventListener("click", this.handleClicks.bind(this), false);
	this.context = this.canvas.getContext("2d");
	this.blockHeight = width / game.playfield.rows;
	this.blockWidth = height / game.playfield.columns;
    };

    CanvasView.prototype.handleClicks = function(event) {
	var canvasX = event.clientX - this.canvas.offsetLeft;
	var canvasY = event.clientY - this.canvas.offsetTop;
	var colRow = CanvasUtilities.coordinatesToCell(canvasX, canvasY, this.blockWidth, this.blockHeight);
	this.game.click(colRow[0], colRow[1]);
	this.drawPlayfield();
    };

    CanvasView.prototype.getColor = function(type) {
	var hash = CanvasUtilities.worldsCrappiestHashFunction(type);
	var colorDepth = 16777215
	var hexString = (hash % colorDepth).toString(16);
	var rgbString = "rgb(" + parseInt(hexString.slice(0,2),16) + "," + parseInt(hexString.slice(2, 4),16) + "," + parseInt(hexString.slice(4, 6),16) + ")";
	return rgbString;
    };

    CanvasView.prototype.drawColumn = function(columnIndex) {
	var blockCoordinates;
	var color;
	var rowIndex;
	for (var rowIndex = 0; rowIndex < this.game.playfield.rows; rowIndex++) {
	    block = this.game.playfield.getBlock(columnIndex, rowIndex);
	    if (typeof block === 'undefined') {
		color = "black";
	    } else {
		color = this.getColor(block.type);
	    }
	    blockCoordinates = CanvasUtilities.getUpperLeftForCell(columnIndex, rowIndex, this.blockWidth, this.blockHeight);
	    this.context.fillStyle = color;
	    this.context.fillRect(blockCoordinates[0],blockCoordinates[1], this.blockWidth, this.blockHeight);
	};
    };

    CanvasView.prototype.drawBlocksLeft = function(blocksLeft) {
	this.context.textBaseline = 'top';
	this.context.strokeStyle = 'white';
	this.context.strokeText(blocksLeft + " blocks left", 10, 10);
    };

    CanvasView.prototype.drawPlayfield = function() {
	for (var columnIndex = 0; columnIndex < this.game.playfield.columns; columnIndex++) {
	    this.drawColumn(columnIndex);
	};
	this.drawBlocksLeft(this.game.getBlocksLeft());
    };

    return {
	CanvasView: CanvasView,
	Playfield: Playfield,
	Block: Block,
	Game: Game
    };
})();

if (typeof exports != 'undefined') {
    exports.Clickomania = Clickomania;
}
