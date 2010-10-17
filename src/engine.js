var Clickomania = {};

Clickomania.Playfield = function(columns, rows) {
    this.columns = columns;
    this.rows = rows;
    this.clear();
    this.counter = 0;
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
    return this.blocks[column][row];
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
    delete this.block[column][row];
    return block;
};

Clickomania.Block = function(type) {
    this.type = type;
    this.roundCounter = 0;
};

Clickomania.Game = function(columns, rows) {
    this.playfield = new Clickomania.Playfield(columns, rows);
    this.initializePlayfield();
};

Clickomania.Game.prototype.initializePlayfield = function() {
    this.playfield.fillWithBlocks(5);
};

Clickomania.AsciiView = function() {
    this.game = new Clickomania.Game(5, 5);
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
