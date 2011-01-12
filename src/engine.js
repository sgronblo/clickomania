var Clickomania = {};

if (typeof exports != 'undefined') {
    exports.Clickomania = Clickomania;
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

Clickomania.Playfield = function(columns, rows) {
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

Clickomania.Playfield.fromAscii = function() {
    //assert all rows are the same length
    var firstRowLength = arguments[0].length;
    var argumentAmount = arguments.length;
    var rowString;
    var rowLength;
    var rowIndex;
    var columnIndex;
    var newPlayfield = new Clickomania.Playfield(firstRowLength, argumentAmount);
    var type;
    for (rowIndex = 0; rowIndex < argumentAmount; rowIndex += 1) {
	rowString = arguments[rowIndex];
	rowLength = rowString.length;
	for (columnIndex = 0; columnIndex < rowLength; columnIndex += 1) {
	    type = rowString[columnIndex];
	    if (type !== ' ') {
		var newBlock = new Clickomania.Block(rowString[columnIndex]);
		newPlayfield.putBlock(columnIndex, rowIndex, newBlock);
	    }
	}
    }
    return newPlayfield;
};

Clickomania.Playfield.prototype.fillWithBlocks = function(numBlockType) {
    var column, row, newBlock, randomBlockType;
    for (column = 0; column < this.columns; column += 1) {
	for (row = 0; row < this.rows; row += 1) {
	    randomBlockType = Math.floor(Math.random() * numBlockType);
	    newBlock = new Clickomania.Block(randomBlockType);
	    this.putBlock(column, row, newBlock);
	}
    }
};

Clickomania.Playfield.prototype.getBlock = function(column, row) {
    var block;
    block = this.blocks[column][row];
    if (block === undefined) {
	return block;
    }
    block.column = column;
    block.row = row;
    return block;
};

Clickomania.Playfield.prototype.getRowString = function(row) {
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

Clickomania.Playfield.prototype.putBlock = function(column, row, block) {
    this.blocks[column][row] = block;
};

Clickomania.Playfield.prototype.clear = function() {
    var column, row;
    for (column = 0; column < this.columns; column++) {
	for (row = 0; row < this.rows; row++) {
	    this.blocks[column][row] = undefined;
	}
    }
};

Clickomania.Playfield.prototype.removeBlock = function(column, row) {
    var block = this.blocks[column][row];
    this.blocks[column][row] = undefined;
    return block;
};

Clickomania.Playfield.prototype.getNeighbours = function(column, row) {
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

Clickomania.Playfield.prototype.getConnectedBlocks = function(column, row) {
    this.counter += 1;
    var connectedBlocks = this.getConnectedBlocks_(column, row, this.counter);
    return connectedBlocks;
};

Clickomania.Playfield.prototype.getConnectedBlocks_ = function(column, row, counter) {
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

Clickomania.Playfield.prototype.compactAndCenter = function() {
    var columnsWithBlocks = this.getColumnsWithBlocks();
    var columnsWithoutBlocks = Clickomania.ArrayUtilies.complement(this.blocks, columnsWithBlocks);
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

Clickomania.Playfield.prototype.clearColumn = function(column) {
    var rowIndex;
    for (rowIndex = 0; rowIndex < this.rows; rowIndex++) {
	this.removeBlock(column, rowIndex);
    }
};

Clickomania.Playfield.prototype.getColumnsWithBlocks = function() {
    var column;
    var columnsWithBlocks = [];
    for (column = 0; column < this.columns; column++) {
	if (this.columnHasBlocks(column)) {
	    columnsWithBlocks.push(this.blocks[column]);
	}
    }
    return columnsWithBlocks;
};

Clickomania.Playfield.prototype.columnHasBlocks = function(columnIndex) {
    var rowIndex;
    for (rowIndex = 0; rowIndex < this.rows; rowIndex++) {
	if (typeof this.getBlock(columnIndex, rowIndex) !== "undefined") {
	    return true;
	}
    }
    return false;
};

Clickomania.Block = function(type) {
    this.type = type;
    this.roundCounter = 0;
};

Clickomania.Game = function(playfield) {
    this.playfield = playfield;
};

Clickomania.Game.prototype.click = function(column, row) {
    var removedBlocksCount = this.removeConnectedBlocks(column, row);
    this.advanceState();
    return removedBlocksCount > 0;
};

Clickomania.Game.prototype.fillPlayfield = function() {
    this.playfield.fillWithBlocks(10);
};

Clickomania.Game.prototype.removeConnectedBlocks = function(column, row) {
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

Clickomania.Game.prototype.dropColumn = function(column) {
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
	return;
    }
    // loop through rows upwards
    for (rowIndex; rowIndex >= 0; rowIndex--) {
	blockToMove = this.playfield.getBlock(column, rowIndex);
	if (typeof blockToMove !== 'undefined') {
	    this.playfield.putBlock(column, pileTopIndex, new Clickomania.Block(blockToMove.type));
	    this.playfield.removeBlock(column, rowIndex);
	    pileTopIndex -= 1;
	}
    }
};

Clickomania.Game.prototype.dropBlocks = function() {
    var columnIndex;
    for (columnIndex = 0; columnIndex < this.playfield.columns; columnIndex++) {
	this.dropColumn(columnIndex);
    }
};

Clickomania.Game.prototype.autoPlay = function() {
    if (this.hasMoreMoves()) {
	this.clickLikeAMadman();
    }
};

Clickomania.Game.prototype.advanceState = function() {
    this.dropBlocks();
    this.playfield.compactAndCenter();
}

Clickomania.Game.prototype.clickLikeAMadman = function() {
    var rowIndex = this.playfield.rows - 1;
    var columnIndex = this.playfield.columns - 1;
    var removedBlocks = 0;
    while (rowIndex >= 0 && removedBlocks < 2) {
	while (columnIndex >= 0 && removedBlocks < 2) {
	    if (typeof this.playfield.getBlock(columnIndex, rowIndex) !== 'undefined') {
		removedBlocks = this.removeConnectedBlocks(columnIndex, rowIndex);
	    }
	    columnIndex -= 1;
	}
	columnIndex = this.playfield.columns - 1;
	rowIndex -= 1;
    }
    this.advanceState();
    canvas.drawPlayfield();
    if (this.hasMoreMoves()) {
	setTimeout(this.clickLikeAMadman.bind(this), 50);
    } else {
	console.log("couldn't find any more moves so I'll stop");
    }
};

Clickomania.Game.prototype.hasMoreMoves = function() {
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

Clickomania.AsciiView = function(game) {
    this.game = game;
};

Clickomania.AsciiView.prototype.drawPlayfield = function(playfieldId) {
    var playfieldElement, column, row;
    playfieldElement = $(playfieldId);
    for (column = 0; column < playfield.columns; column++) {
	for (row = 0; row < playfield.rows; row++) {
	    playfieldElement.append(block.type);
	}
	playfieldElement.append('<br>');
    }
};

Clickomania.ArrayUtilies = {};

Clickomania.ArrayUtilies.complement = function complement(all, some) {
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

Clickomania.CanvasView = function(width, height, playfieldId, game) {
    this.width = width;
    this.height = height;
    this.game = game;
    this.canvas = document.getElementById(playfieldId);
    this.canvas.setAttribute('width', this.width);
    this.canvas.setAttribute('height', this.height);
    this.canvas.addEventListener("click", this.handleClicks.bind(this))
    this.context = this.canvas.getContext("2d");
    this.blockHeight = width / game.playfield.rows;
    this.blockWidth = height / game.playfield.columns;
};

Clickomania.CanvasView.prototype.handleClicks = function(event) {
    var canvasX = event.clientX - this.canvas.offsetLeft;
    var canvasY = event.clientY - this.canvas.offsetTop;
    var colRow = this.coordinatesToCell(canvasX, canvasY);
    this.game.removeConnectedBlocks(colRow[0], colRow[1]);
    this.game.advanceState();
    this.drawPlayfield();
};

Clickomania.CanvasView.prototype.coordinatesToCell = function(x, y) {
    var column = Math.floor(x / this.blockWidth);
    var row = Math.floor(y / this.blockHeight);
    return [column, row];
};

Clickomania.CanvasView.prototype.getUpperLeftForCell = function(columnIndex, rowIndex) {
    var upperLeft, lowerRight;
    upperLeft = [columnIndex * this.blockHeight, rowIndex * this.blockWidth]
    return upperLeft;
};

Clickomania.CanvasView.prototype.getColor = function(type) {
    var v = 100 + type * 8;
    return "rgb(" + 20 + "," + v + "," + v + ")";
};

Clickomania.CanvasView.prototype.drawColumn = function(columnIndex) {
    var this_ = this;
    var blockCoordinates;
    var color;
    var rowIndex;
    for (var rowIndex = 0; rowIndex < this.game.playfield.rows; rowIndex++) {
	block = this.game.playfield.getBlock(columnIndex, rowIndex);
	if (typeof block === 'undefined') {
	    color = "gray";
	} else {
	    color = this.getColor(block.type);
	}
	blockCoordinates = this_.getUpperLeftForCell(columnIndex, rowIndex);
	this_.context.fillStyle = color;
	this_.context.fillRect(blockCoordinates[0],blockCoordinates[1], this_.blockWidth, this_.blockHeight);
    };
};

Clickomania.CanvasView.prototype.drawPlayfield = function() {
    for (var columnIndex = 0; columnIndex < this.game.playfield.columns; columnIndex++) {
	this.drawColumn(columnIndex);
    };
};
