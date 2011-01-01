if (typeof Clickomania == 'undefined') {
    // if we run in a browser the file containing the Clickomania object must
    // be manually included before the test file
    Clickomania = require('../src/engine.js').Clickomania;
}

TestUtilities = {
    objectToString: function(object) {
	var propertyValueStrings = [];
	var propertyName
	for (propertyName in object) {
	    if (object.hasOwnProperty(propertyName)) {
		propertyValueStrings.push(propertyName + ": " + object[propertyName]);
	    }
	}
	return "{" + propertyValueStrings.join(", ") + "}";
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
		message: "expected elements: " + expectedElements + " and actual elements: " + actualElements + " have different lengths",
		stack: new Error().stack
	    };
	}
	if (!expectedElements.every(function(elementValue, elementIndex, array) {
	    var index;
	    for (index in actualElements) {
		if (actualElements[index] === elementValue) {
		    return true;
		}
	    }
	    message = elementValue + " did not exist in [" + actualElements + "]";
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
    }
};

function EngineTest () {
    this.name = "EngineTest";
    this.PLAYFIELD_COLUMNS = 5;
    this.PLAYFIELD_ROWS = 4;
    this.PLAYFIELD_TYPES = 3;
};

var PlayfieldFactory = {
    buildBasicField: function() {
	var basicField = new Clickomania.Playfield(this.PLAYFIELD_COLUMNS, this.PLAYFIELD_ROWS);
	var Block = Clickomania.Block;
	basicField.blocks = [
	    [new Block(1), new Block(1), new Block(2), new Block(2)],
	    [new Block(1), new Block(0), new Block(2), new Block(0)],
	    [new Block(0), new Block(2), new Block(2), new Block(1)],
	    [new Block(1), new Block(2), new Block(2), new Block(0)],
	    [new Block(0), new Block(0), new Block(0), new Block(2)]
	];
	return basicField;
    }
};

EngineTest.prototype.testFromAscii = function() {
    var testAsciiData = [
	"  X  ",
	" YYX ",
	"XXZY "];
    var createdPlayfield = Clickomania.Playfield.fromAscii.apply(this, testAsciiData);
    Assert.assertEqual(" ", createdPlayfield.getBlock(0, 0).type);
    Assert.assertEqual("X", createdPlayfield.getBlock(2, 0).type);
    Assert.assertEqual(" ", createdPlayfield.getBlock(4, 0).type);
    Assert.assertEqual("Y", createdPlayfield.getBlock(2, 1).type);
    Assert.assertEqual("X", createdPlayfield.getBlock(0, 2).type);
    Assert.assertEqual(" ", createdPlayfield.getBlock(4, 2).type);
}

EngineTest.prototype.testGetConnectedBlocks = function() {
    var basicField, connectedBlocks;
    basicField = PlayfieldFactory.buildBasicField();
    connectedBlocks = basicField.getConnectedBlocks(0, 0);
    expectedBlocks = [
	basicField.getBlock(0, 0),
	basicField.getBlock(1, 0),
	basicField.getBlock(0, 1)
    ];
    Assert.assertListsHaveSameElements(expectedBlocks, connectedBlocks);
    connectedBlocks = basicField.getConnectedBlocks(2, 1);
    expectedBlocks = [
	basicField.getBlock(0, 2),
	basicField.getBlock(0, 3),
	basicField.getBlock(1, 2),
	basicField.getBlock(2, 1),
	basicField.getBlock(2, 2),
	basicField.getBlock(3, 1),
	basicField.getBlock(3, 2)
    ];
    Assert.assertListsHaveSameElements(expectedBlocks, connectedBlocks);
};

EngineTest.prototype.testRemoveBlock = function() {
    var basicField, block, expectedBlock;
    basicField = PlayfieldFactory.buildBasicField();
    expectedBlock = basicField.getBlock(0, 0);
    block = basicField.removeBlock(0, 0);
    Assert.assertEqual(block, expectedBlock);
    block = basicField.getBlock(0, 0);
    Assert.assertUndefined(block);
}

EngineTest.prototype.testFillWithBlocks = function() {
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

EngineTest.prototype.testFillHole = function() {
    var basicField = PlayfieldFactory.buildBasicField();
    basicField.removeBlock(1, 0);
    basicField.removeBlock(1, 1);
    basicField.removeBlock(1, 2);
    basicField.removeBlock(1, 3);
    basicField.fillHole(1);
    Assert.assertUndefined(basicField.getBlock(0, 0));
    Assert.assertDefined(basicField.getBlock(1, 0));
}

EngineTest.prototype.testGetEmptyColumns = function() {
    var basicField, emptyColumns;
    basicField = PlayfieldFactory.buildBasicField();
    basicField.removeBlock(1, 0);
    basicField.removeBlock(1, 1);
    basicField.removeBlock(1, 2);
    basicField.removeBlock(1, 3);
    emptyColumns = basicField.getEmptyColumns();
    Assert.assertEqual(emptyColumns[0], 1);
};

EngineTest.prototype.testFillHoles = function() {
    var basicField;
    basicField = PlayfieldFactory.buildBasicField();
    basicField.removeBlock(1, 0);
    basicField.removeBlock(1, 1);
    basicField.removeBlock(1, 2);
    basicField.removeBlock(1, 3);
    basicField.fillHoles();
    Assert.assertUndefined(basicField.getBlock(0, 0));
    Assert.assertDefined(basicField.getBlock(1, 0));
};

function GameTest() {
    this.name = "GameTest";
};

GameTest.prototype.testRemoveConnectedBlocks = function() {
    var basicField, game;
    basicField = PlayfieldFactory.buildBasicField();
    Assert.assertDefined(basicField);
    game = new Clickomania.Game(basicField);
    Assert.assertDefined(game);
    game.removeConnectedBlocks(0, 0);
    Assert.assertUndefined(basicField.getBlock(0, 0));
    Assert.assertUndefined(basicField.getBlock(0, 1));
    Assert.assertUndefined(basicField.getBlock(1, 0));
    game.removeConnectedBlocks(4, 3);
    Assert.assertDefined(basicField.getBlock(4, 3));
}

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
	    console.error("testCase " + testName + " had failures");
	} else {
	    console.info("testCase " + testName + " passed without failure");
	}
	return failedTests;
    }
};

var testCaseClasses = [EngineTest, GameTest];

function runAllTestCases() {
    testCaseClasses.forEach(function(testCaseClass) {
	var newTestCase = new testCaseClass();
	TestRunner.runTestCase(newTestCase);
    });
}

runAllTestCases();
