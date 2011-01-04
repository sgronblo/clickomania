var Clickomania = {};

if (typeof exports != 'undefined') {
    exports.Clickomania = Clickomania;
}

Clickomania.Playfield = function(columns, rows) {
    this.columns = columns;
    this.rows = rows;
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
    for (rowIndex = 0; rowIndex < argumentAmount; rowIndex += 1) {
	rowString = arguments[rowIndex];
	rowLength = rowString.length;
	for (columnIndex = 0; columnIndex < rowLength; columnIndex += 1) {
	    var newBlock = new Clickomania.Block(rowString[columnIndex]);
	    newPlayfield.putBlock(columnIndex, rowIndex, newBlock);
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

Clickomania.Playfield.prototype.putBlock = function(column, row, block) {
    this.blocks[column][row] = block;
};

Clickomania.Playfield.prototype.clear = function() {
    var column;
    this.blocks = new Array(this.columns);
    for (column = 0; column < this.columns; column++) {
	this.blocks[column] = new Array(this.rows);
    }
};

Clickomania.Playfield.prototype.removeBlock = function(column, row) {
    var block = this.blocks[column][row];
    delete this.blocks[column][row];
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
    block.roundCounter = counter;
    connected.push(block);
    neighbours = this.getNeighbours(column, row);
    neighbours.forEach(function(neighbour) {
	if (neighbour.type === block.type && neighbour.roundCounter < counter) {
	    connected = connected.concat(this_.getConnectedBlocks_(neighbour.column, neighbour.row, counter));
	}
    });
    return connected;
};

Clickomania.Playfield.prototype.getEmptyColumns = function() {
    var emptyColumns = [], connectedBlocks = undefined, block;
    for(var column = 0; column < this.columns; column += 1) {
	connectedBlocks = undefined;
	for(var row = 0; row < this.blocks[column].length; row += 1) {
	   block = this.getBlock(column, row);
	   if(block !== undefined) {
	       connectedBlocks = 1;
	       break;
	   }
	}
	if(connectedBlocks === undefined) {
	    emptyColumns.push(column);
	}
    }
    return emptyColumns;
};

Clickomania.Playfield.prototype.fillHole = function(holeColumn) {
    var previousColumn, removing = this.blocks[holeColumn];
    var startColumn = 1;
    var lastColumn = 0;
    var direction = holeColumn > (this.columns / 2) ? 1 : -1;
    var endColumn = holeColumn + direction;
    for(var currentColumn = startColumn; currentColumn !== endColumn; currentColumn += direction) {
	previousColumn = currentColumn - direction;
	this.blocks[currentColumn] = this.blocks[previousColumn];
    }
    this.blocks[lastColumn] = removing;
};

Clickomania.Playfield.prototype.fillHoles = function() {
    var emptyColumns = this.getEmptyColumns(), this_ = this;
    emptyColumns.forEach(function(index) {
	this_.fillHole(index);
    });
};

Clickomania.Block = function(type) {
    this.type = type;
    this.roundCounter = 0;
};

Clickomania.Game = function(playfield) {
    this.playfield = playfield;
};

Clickomania.Game.prototype.fillPlayfield = function() {
    this.playfield.fillWithBlocks(5);
};

Clickomania.Game.prototype.removeConnectedBlocks = function(column, row) {
    var connectedBlocks, this_ = this;
    connectedBlocks = this.playfield.getConnectedBlocks(column, row);
    if (connectedBlocks.length < 2) {
	return;
    }
    connectedBlocks.forEach(function(block) {
	this_.playfield.removeBlock(block.column, block.row);
    });
}

Clickomania.AsciiView = function() {
    this.game = new Clickomania.Game(new Clickomania.Playfield(5, 5));
    this.game.fillPlayfield();
};

Clickomania.AsciiView.prototype.drawPlayfield = function(playfieldId) {
    var playfieldElement, column, row;
    playfieldElement = $(playfieldId);
    this.game.playfield.blocks.forEach(function(column) {
	column.forEach(function(block) {
	    playfieldElement.append(block.type);
	});
	playfieldElement.append('<br>');
    });
};
