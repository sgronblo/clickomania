function TestCase () {};

TestCase.prototype.assertEqual = function(expected, actual) {
    if (expected !== actual) {
	throw {message: expected + " !== " + actual};
    }
};

TestCase.prototype.assertListsHaveSameElements = function(expectedElements, actualElements) {
    var message;
    if (expectedElements.length !== actualElements.length) {
	throw {message: "expected elements: " + expectedElements + " and actual elements: " + actualElements + " have different lengths"
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
	throw {message: message};
    }
};

TestCase.prototype.assertTrue = function(boolean) {
    if (!boolean) {
	throw {message: "False when expected true"};
    }
};

TestCase.prototype.assertUndefined = function(possibleUndefined) {
    if (! (possibleUndefined === undefined)) {
	throw {message: "Variable was defined (" + possibleUndefined + ") when expected undefined"};
    }
};

TestCase.prototype.assertDefined = function(possibleDefined) {
    if (possibleDefined === undefined) {
	throw {message: "Variable was undefined (" + possibleDefined + ") when expected defined"};
    }
};

TestCase.prototype.assertInRange = function(lowestAllowedValue, highestAllowedValue, value) {
    var message;
    if (value < lowestAllowedValue) {
	message = value + " should not be less than " + lowestAllowedValue;
    } else if (value > highestAllowedValue) {
	message = value + " should not be greater than " + highestAllowedValue;
    }
    if (message !== undefined) {
	throw {message: message};
    }
};

function EngineTest () {
    this.PLAYFIELD_COLUMNS = 5;
    this.PLAYFIELD_ROWS = 4;
    this.PLAYFIELD_TYPES = 3;
};

function GameTest() {};

EngineTest.prototype = new TestCase();

GameTest.prototype = new TestCase();

EngineTest.prototype.buildBasicField = function() {
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
};

EngineTest.prototype.testGetConnectedBlocks = function() {
    var basicField, connectedBlocks;
    basicField = this.buildBasicField();
    connectedBlocks = basicField.getConnectedBlocks(0, 0);
    expectedBlocks = [
	basicField.getBlock(0, 0),
	basicField.getBlock(1, 0),
	basicField.getBlock(0, 1)
    ];
    this.assertListsHaveSameElements(expectedBlocks, connectedBlocks);
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
    this.assertListsHaveSameElements(expectedBlocks, connectedBlocks);
};

EngineTest.prototype.testRemoveBlock = function() {
    var basicField, block, expectedBlock;
    basicField = this.buildBasicField();
    expectedBlock = basicField.getBlock(0, 0);
    block = basicField.removeBlock(0, 0);
    this.assertEqual(block, expectedBlock);
    block = basicField.getBlock(0, 0);
    this.assertUndefined(block);
}

GameTest.prototype.testRemoveConnectedBlocks = function() {
    var basicField, game;
    basicField = new EngineTest().buildBasicField();
    this.assertDefined(basicField);
    game = new Clickomania.Game(basicField);
    this.assertDefined(game);
    game.removeConnectedBlocks(0, 0);
    this.assertUndefined(basicField.getBlock(0, 0));
    //this.assertUndefined(basicField.getBlock(0, 1));
    //this.assertUndefined(basicField.getBlock(1, 0));
    //basicField.removeConnectedBlocks(4, 3);
    //this.assertDefined(basicField.getBlock(4, 3));
}

EngineTest.prototype.testFillWithBlocks = function() {
    var column, row, testPlayfield, testBlock;
    testPlayfield = new Clickomania.Playfield(this.PLAYFIELD_COLUMNS, this.PLAYFIELD_ROWS);
    testPlayfield.fillWithBlocks(this.PLAYFIELD_TYPES);
    for (column = 0; column < this.PLAYFIELD_COLUMNS; column += 1) {
	for (row = 0; row < this.PLAYFIELD_ROWS; row += 1) {
	    testBlock = testPlayfield.getBlock(column, row);
	    this.assertInRange(0, this.PLAYFIELD_TYPES - 1, testBlock.type);
	}
    }
};

StringUtilities = {
    startsWith: function(string, prefix) {
	return string.lastIndexOf(prefix, 0) === 0;
    }
};

TestRunner = {
    runTestCase: function(testCase) {
	var memberName, member, testFailure, failedTests;
	failedTests = [];
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
	if (failedTests.length > 0) {
	    console.error("tests had failures");
	} else {
	    console.info("testCase " + testCase + " passed without failure");
	}
	return failedTests;
    }
};

var testCaseClasses = [EngineTest, GameTest]

function runAllTestCases() {
    testCaseClasses.forEach(function(testCaseClass) {
	var newTestCase = testCaseClass();
	TestRunner.runTestCase(newTestCase);
    });
}
