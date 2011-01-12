if (typeof Clickomania == 'undefined') {
    // if we run in a browser the file containing the Clickomania object must
    // be manually included before the test file
    Clickomania = require('../src/engine.js').Clickomania;
}

TestUtilities = {
    objectToString: function(object) {
	if (typeof object != 'object') {
	    return object;
	}
	var propertyValueStrings = [];
	var propertyName
	for (propertyName in object) {
	    if (object.hasOwnProperty(propertyName)) {
		propertyValueStrings.push(propertyName + ": " + TestUtilities.objectToString(object[propertyName]));
	    }
	}
	return "{" + propertyValueStrings.join(", ") + "}";
    },
    printPlayfield: function(playfield) {
	var row;
	for (row = 0; row < playfield.rows; row++) {
	    console.log(playfield.getRowString(row));
	}
    }
};

Assert = {
    assertEqual: function(expected, actual) {
	if (expected !== actual) {
	    throw {
		message: expected + " !== " + actual,
		stack: new Error().stack
	    };
	}
    },
    assertListsHaveSameElements: function(expectedElements, actualElements) {
	var message;
	if (expectedElements.length !== actualElements.length) {
	    throw {
		message: "expected elements: " + TestUtilities.objectToString(expectedElements) + " and actual elements: " + TestUtilities.objectToString(actualElements) + " have different lengths",
		stack: new Error().stack
	    };
	}
	if (!expectedElements.every(function(elementValue) {
	    var index;
	    for (index in actualElements) {
		if (actualElements.hasOwnProperty(index)) {
		    if (actualElements[index] === elementValue) {
			return true;
		    }
		}
	    }
	    message = TestUtilities.objectToString(elementValue) + " did not exist in " + TestUtilities.objectToString(actualElements);
	    return false;
	})) {
	    throw {
		message: message,
		stack: new Error().stack
	    };
	}
    },
    assertTrue: function(boolean) {
	if (!boolean) {
	    throw {
		message: "False when expected true",
		stack: new Error().stack
	    };
	}
    },
    assertFalse: function(boolean) {
	if (boolean) {
	    throw {
		message: "True when expected false",
		stack: new Error().stack
	    };
	}
    },
    assertUndefined: function(possibleUndefined) {
	if (typeof possibleUndefined !== 'undefined') {
	    throw {
		message: "Variable was defined (" + TestUtilities.objectToString(possibleUndefined) + ") when expected undefined",
		stack: new Error().stack
	    };
	}
    },
    assertDefined: function(possibleDefined) {
	if (typeof possibleDefined === 'undefined') {
	    throw {
		message: "Variable was undefined (" + TestUtilities.objectToString(possibleDefined) + ") when expected defined",
		stack: new Error().stack
	    };
	}
    },
    assertInRange: function(lowestAllowedValue, highestAllowedValue, value) {
	var message;
	if (value < lowestAllowedValue) {
	    message = value + " should not be less than " + lowestAllowedValue;
	} else if (value > highestAllowedValue) {
	    message = value + " should not be greater than " + highestAllowedValue;
	}
	if (message !== undefined) {
	    throw {
		message: message,
		stack: new Error().stack
	    };
	}
    },
    assertPlayfieldMatchesAscii: function(playfield) {
	// weak checking that the first playfield parameter isn't missing
	if (typeof playfield === 'string') {
	    throw {
		message: "Expected a non-string as first parameter, got: " + TestUtilities.objectToString(playfield),
		stack: new Error().stack
	    }
	}
	var rowIndex, columnIndex;
	var expectedType, actualBlock;
	var asciiRows = Array.prototype.slice.call(arguments, 1);
	if (asciiRows[0].length !== playfield.blocks.length) {
	    throw {
		message: "Expected rows to have a length of " + asciiRows[0].length + " but was " + playfield.blocks.length,
		stack: new Error().stack
	    }
	}
	if (asciiRows.length !== playfield.blocks[0].length) {
	    throw {
		message: "Expected columns to have a height of " + asciiRows.length + " but was " + playfield.blocks[0].length,
		stack: new Error().stack
	    }
	}
	for (columnIndex = 0; columnIndex < playfield.columns; columnIndex++) {
	    for (rowIndex = 0; rowIndex < playfield.rows; rowIndex++) {
		expectedType = asciiRows[rowIndex][columnIndex];
		actualBlock = playfield.getBlock(columnIndex, rowIndex);
		if (expectedType === " ") {
		    if (typeof actualBlock !== 'undefined') {
			throw {
			    message: "Found block of type: " + actualBlock.type + " at col: " + columnIndex + ", row: " + rowIndex + " when expecting empty cell",
			    stack: new Error().stack
			};
		    }
		} else if (typeof actualBlock === 'undefined') {
		    throw {
			message: "Empty block at col: " + columnIndex + ", row: " + rowIndex + " where a block of type " + expectedType + " was expected",
			stack: new Error().stack
		    };
		} else {
		    Assert.assertEqual(expectedType, actualBlock.type);
		}
	    }
	}
    }
};

var buildBasicField = function() {
    return Clickomania.Playfield.fromAscii(
	"1122",
	"1020",
	"0221",
	"1220",
	"0002");
}

var EngineTest = {};

EngineTest.name = "EngineTest";
EngineTest.PLAYFIELD_COLUMNS = 5;
EngineTest.PLAYFIELD_ROWS = 4;
EngineTest.PLAYFIELD_TYPES = 3;

EngineTest.testFromAscii = function() {
    var testAsciiData = [
	"  X  ",
	" YYX ",
	"XXZY "];
    var createdPlayfield = Clickomania.Playfield.fromAscii.apply(this, testAsciiData);
    Assert.assertUndefined(createdPlayfield.getBlock(0, 0));
    Assert.assertEqual("X", createdPlayfield.getBlock(2, 0).type);
    Assert.assertUndefined(createdPlayfield.getBlock(4, 0));
    Assert.assertEqual("Y", createdPlayfield.getBlock(2, 1).type);
    Assert.assertEqual("X", createdPlayfield.getBlock(0, 2).type);
    Assert.assertUndefined(createdPlayfield.getBlock(4, 2));
};

EngineTest.testGetRowString = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"XYZ",
	"YZX");
    Assert.assertEqual("[XYZ]", testPlayfield.getRowString(0));
    Assert.assertEqual("[YZX]", testPlayfield.getRowString(1));
};

EngineTest.testGetConnectedBlocks = function() {
    var basicField, connectedBlocks, expectedBlocks;
    basicField = buildBasicField();
    connectedBlocks = basicField.getConnectedBlocks(0, 0);
    expectedBlocks = [
	basicField.getBlock(0, 0),
	basicField.getBlock(1, 0),
	basicField.getBlock(0, 1)
    ];
    Assert.assertListsHaveSameElements(expectedBlocks, connectedBlocks);
    connectedBlocks = basicField.getConnectedBlocks(2, 1);
    expectedBlocks = [
	basicField.getBlock(1, 2),
	basicField.getBlock(1, 3),
	basicField.getBlock(2, 0),
	basicField.getBlock(2, 1),
	basicField.getBlock(2, 2),
	basicField.getBlock(2, 3),
	basicField.getBlock(3, 0)
    ];
    Assert.assertListsHaveSameElements(expectedBlocks, connectedBlocks);
};

EngineTest.testRemoveBlock = function() {
    var basicField, block, expectedBlock;
    basicField = buildBasicField();
    expectedBlock = basicField.getBlock(0, 0);
    block = basicField.removeBlock(0, 0);
    Assert.assertEqual(block, expectedBlock);
    block = basicField.getBlock(0, 0);
    Assert.assertPlayfieldMatchesAscii(
	basicField,
	" 122",
	"1020",
	"0221",
	"1220",
	"0002");
}

EngineTest.testFillWithBlocks = function() {
    var column, row, testPlayfield, testBlock;
    testPlayfield = new Clickomania.Playfield(this.PLAYFIELD_COLUMNS, this.PLAYFIELD_ROWS);
    testPlayfield.fillWithBlocks(this.PLAYFIELD_TYPES);
    for (column = 0; column < this.PLAYFIELD_COLUMNS; column += 1) {
	for (row = 0; row < this.PLAYFIELD_ROWS; row += 1) {
	    testBlock = testPlayfield.getBlock(column, row);
	    Assert.assertInRange(0, this.PLAYFIELD_TYPES - 1, testBlock.type);
	}
    }
};

EngineTest.testClearColumn = function() {
    var basicField = buildBasicField();
    basicField.clearColumn(3);
    Assert.assertPlayfieldMatchesAscii(
	basicField,
	"112 ",
	"102 ",
	"022 ",
	"122 ",
	"000 ");
};

EngineTest.testGetColumnsWithBlocks = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"X A ",
	"Y B ");
    var columnsWithBlocks = testPlayfield.getColumnsWithBlocks();
    Assert.assertEqual(columnsWithBlocks[0][0].type, "X");
    Assert.assertEqual(columnsWithBlocks[0][1].type, "Y");
    Assert.assertEqual(columnsWithBlocks[1][0].type, "A");
    Assert.assertEqual(columnsWithBlocks[1][1].type, "B");
}

EngineTest.testColumnHasBlocks = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"A B ",
	"A CA",
	"A CB");
    Assert.assertTrue(testPlayfield.columnHasBlocks(0));
    Assert.assertFalse(testPlayfield.columnHasBlocks(1));
    Assert.assertTrue(testPlayfield.columnHasBlocks(2));
    Assert.assertTrue(testPlayfield.columnHasBlocks(3));
}

EngineTest.testCompactAndCenterNothingShouldHappen = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"123",
	"124",
	"021",
	"122",
	"000");
    testPlayfield.compactAndCenter();
    Assert.assertPlayfieldMatchesAscii(
	testPlayfield,
	"123",
	"124",
	"021",
	"122",
	"000");
};

EngineTest.testCompactAndCenterAddEvenEmptyLineAmount = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1 2 3",
	"1 2 4",
	"0 2 1",
	"1 2 2",
	"0 0 0");
    testPlayfield.compactAndCenter();
    Assert.assertPlayfieldMatchesAscii(
	testPlayfield,
	" 123 ",
	" 124 ",
	" 021 ",
	" 122 ",
	" 000 ");
};

EngineTest.testCompactAndCenterAddUnevenEmptyLineAmount = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1 22",
	"1 20",
	"0 21",
	"1 20",
	"0 02");
    testPlayfield.compactAndCenter();
    Assert.assertPlayfieldMatchesAscii(
	testPlayfield,
	" 122",
	" 120",
	" 021",
	" 120",
	" 002");
};

EngineTest.testCompactAndCenterTwoEmptyRows = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1  2",
	"1  0",
	"0  1",
	"1  0",
	"0  2");
    testPlayfield.compactAndCenter();
    Assert.assertPlayfieldMatchesAscii(
	testPlayfield,
	" 12 ",
	" 10 ",
	" 01 ",
	" 10 ",
	" 02 ");
};

var GameTest = {};
GameTest.name = "GameTest";

GameTest.testRemoveConnectedBlocks = function() {
    var basicField, game;
    basicField = Clickomania.Playfield.fromAscii(
	"1122",
	"1020",
	"0221",
	"1220",
	"0002");
    Assert.assertDefined(basicField);
    game = new Clickomania.Game(basicField);
    Assert.assertDefined(game);
    game.removeConnectedBlocks(0, 0);
    Assert.assertPlayfieldMatchesAscii(
	game.playfield,
	"  22",
	" 020",
	"0221",
	"1220",
	"0002");
    // nothing should happen when trying to remove connected blocks for a block
    // with no similar neighbors
    game.removeConnectedBlocks(3, 4);
    Assert.assertPlayfieldMatchesAscii(
	game.playfield,
	"  22",
	" 020",
	"0221",
	"1220",
	"0002");
};

GameTest.testDropColumnShortColumnFall = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1 ",
	" 1");
    var testGame = new Clickomania.Game(testPlayfield);
    testGame.dropColumn(0);
    Assert.assertPlayfieldMatchesAscii(
	testGame.playfield,
	"  ",
	"11");
};

GameTest.testDropColumnBlocksAlreadyAtBottom = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"  ",
	"11");
    var testGame = new Clickomania.Game(testPlayfield);
    testGame.dropColumn(0);
    testGame.dropColumn(1);
    Assert.assertPlayfieldMatchesAscii(
	testGame.playfield,
	"  ",
	"11");
};

GameTest.testDropColumnFullColumn = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1 ",
	"11");
    var testGame = new Clickomania.Game(testPlayfield);
    testGame.dropColumn(0);
    Assert.assertPlayfieldMatchesAscii(
	testGame.playfield,
	"1 ",
	"11");
};

GameTest.testDropBlocks = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1122",
	"10 0",
	"   1",
	" 2 0",
	"00 2");
    var testGame = new Clickomania.Game(testPlayfield);
    testGame.dropBlocks();
    Assert.assertPlayfieldMatchesAscii(
	testGame.playfield,
	"   2",
	" 1 0",
	"10 1",
	"12 0",
	"0022");
};

GameTest.testShouldNotFindMoreMoves = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	" 123 ",
	" 231 ",
	" 312 ");
    var testGame = new Clickomania.Game(testPlayfield);
    var isMoreMoves = testGame.hasMoreMoves();
    Assert.assertFalse(isMoreMoves);
};

GameTest.testShouldFindMoreMoves = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	" 123 ",
	" 233 ",
	" 312 ");
    var testGame = new Clickomania.Game(testPlayfield);
    var isMoreMoves = testGame.hasMoreMoves();
    Assert.assertTrue(isMoreMoves);
};

var CanvasUtilitiesTest = {};

CanvasUtilitiesTest.testGetUpperLeftForCell = function() {
    var blockWidth = 30;
    var blockHeight = 30;
    var CanvasUtilities = Clickomania.CanvasUtilities;
    var coordinates = CanvasUtilities.getUpperLeftForCell(0, 0, blockWidth, blockHeight);
    Assert.assertEqual(0, coordinates[0]);
    Assert.assertEqual(0, coordinates[1]);
    var coordinates = CanvasUtilities.getUpperLeftForCell(1, 1, blockWidth, blockHeight);
    Assert.assertEqual(30, coordinates[0]);
    Assert.assertEqual(30, coordinates[1]);
    var coordinates = CanvasUtilities.getUpperLeftForCell(1, 2, blockWidth, blockHeight);
    Assert.assertEqual(30, coordinates[0]);
    Assert.assertEqual(60, coordinates[1]);
};

CanvasUtilitiesTest.testCoordinatesToCell = function() {
    var blockWidth = 30;
    var blockHeight = 30;
    var CanvasUtilities = Clickomania.CanvasUtilities;
    var colRow = CanvasUtilities.coordinatesToCell(0, 0, blockWidth, blockHeight);
    Assert.assertEqual(0, colRow[0]);
    Assert.assertEqual(0, colRow[1]);
    var colRow = CanvasUtilities.coordinatesToCell(30, 0, blockWidth, blockHeight);
    Assert.assertEqual(1, colRow[0]);
    Assert.assertEqual(0, colRow[1]);
    var colRow = CanvasUtilities.coordinatesToCell(0, 30, blockWidth, blockHeight);
    Assert.assertEqual(0, colRow[0]);
    Assert.assertEqual(1, colRow[1]);
    var colRow = CanvasUtilities.coordinatesToCell(35, 35, blockWidth, blockHeight);
    Assert.assertEqual(1, colRow[0]);
    Assert.assertEqual(1, colRow[1]);
};

var ArrayUtiliesTest = {};
ArrayUtiliesTest.name = "ArrayUtiliesTest";

ArrayUtiliesTest.testComplement = function() {
    var all, some, expectedComplement;
    all = [1,2,3,4,5];
    some = [1,2,5];
    expectedComplement = [3,4];
    Assert.assertListsHaveSameElements(expectedComplement, Clickomania.ArrayUtilies.complement(all, some));
};

TestRunner = {
    runTestCase: function(testCase) {
	var memberName, member, testFailure, failedTests, testName;
	failedTests = [];
	// Run all methods prefixed with test as test methods
	for (memberName in testCase) {
	    member = testCase[memberName];
	    if (typeof member === 'function' && StringUtilities.startsWith(memberName, 'test')) {
		try {
		    member.call(testCase);
		} catch (testFailure) {
		    failedTests.push(memberName);
		    console.log("Failure: " + memberName + ", message: " + testFailure.message);
		    console.log(testFailure.stack);
		}
	    }
	}
	// Get name of test case or set it to unnamed
	if (typeof testCase.name !== 'undefined') {
	    testName = testCase.name;
	} else {
	    testName = "unnamed test";
	}
	// Print status of test run
	if (failedTests.length > 0) {
	    console.error("Test case " + testName + " had failures.");
	} else {
	    console.info("Test case " + testName + " passed without failure.");
	}
	return failedTests;
    }
};

var testCases = [EngineTest, GameTest, ArrayUtiliesTest, CanvasUtilitiesTest];

function runAllTestCases() {
    testCases.forEach(function(testCase) {
	TestRunner.runTestCase(testCase);
    });
}

runAllTestCases();
