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
	for (columnIndex = 0; columnIndex < playfield.columns; columnIndex++) {
	    for (rowIndex = 0; rowIndex < playfield.rows; rowIndex++) {
		expectedType = asciiRows[rowIndex][columnIndex];
		actualBlock = playfield.getBlock(columnIndex, rowIndex);
		if (expectedType === " ") {
		    Assert.assertUndefined(actualBlock);
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
    Assert.assertUndefined(block);
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

EngineTest.testFillHole = function() {
    var basicField = buildBasicField();
    basicField.removeBlock(1, 0);
    basicField.removeBlock(1, 1);
    basicField.removeBlock(1, 2);
    basicField.removeBlock(1, 3);
    basicField.removeBlock(1, 4);
    basicField.fillHole(1);
    Assert.assertUndefined(basicField.getBlock(0, 0));
    Assert.assertDefined(basicField.getBlock(1, 0));
}

EngineTest.testGetEmptyColumns = function() {
    var basicField, emptyColumns;
    basicField = buildBasicField();
    basicField.removeBlock(1, 0);
    basicField.removeBlock(1, 1);
    basicField.removeBlock(1, 2);
    basicField.removeBlock(1, 3);
    basicField.removeBlock(1, 4);
    emptyColumns = basicField.getEmptyColumns();
    Assert.assertEqual(emptyColumns[0], 1);
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

EngineTest.testCompactAndCenter = function() {
    var testPlayfield = Clickomania.Playfield.fromAscii(
	"1 22",
	"1 20",
	"0 21",
	"1 20",
	"0 02");
    testPlayfield.compactAndCenter();
    Assert.assertUndefined(testPlayfield.getBlock(0, 0));
    Assert.assertDefined(testPlayfield.getBlock(1, 0));
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
    basicField = buildBasicField();
    Assert.assertDefined(basicField);
    game = new Clickomania.Game(basicField);
    Assert.assertDefined(game);
    game.removeConnectedBlocks(0, 0);
    Assert.assertUndefined(basicField.getBlock(0, 0));
    Assert.assertUndefined(basicField.getBlock(0, 1));
    Assert.assertUndefined(basicField.getBlock(1, 0));
    game.removeConnectedBlocks(3, 4);
    Assert.assertDefined(basicField.getBlock(3, 4));
}

var ArrayUtiliesTest = {};
ArrayUtiliesTest.name = "ArrayUtiliesTest";

ArrayUtiliesTest.testComplement = function() {
    var all, some, expectedComplement;
    all = [1,2,3,4,5];
    some = [1,2,5];
    expectedComplement = [3,4];
    Assert.assertListsHaveSameElements(expectedComplement, Clickomania.ArrayUtilies.complement(all, some));
};

StringUtilities = {
    startsWith: function(string, prefix) {
	return string.lastIndexOf(prefix, 0) === 0;
    }
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

var testCases = [EngineTest, GameTest, ArrayUtiliesTest];

function runAllTestCases() {
    testCases.forEach(function(testCase) {
	TestRunner.runTestCase(testCase);
    });
}

runAllTestCases();
