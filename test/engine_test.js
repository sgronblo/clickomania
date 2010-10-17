var TestCase = function() {};

TestCase.prototype.assertEqual = function(expected, actual) {
    if (expected !== actual) {
	throw {message: expected + " !== " + actual};
    }
};

TestCase.prototype.assertTrue = function(boolean) {
    if (!boolean) {
	throw {message: "False when expected true"};
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

var EngineTest = function() {
    this.PLAYFIELD_COLUMNS = 4;
    this.PLAYFIELD_ROWS = 5;
    this.PLAYFIELD_TYPES = 3;
};

EngineTest.prototype = new TestCase();

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

engineTest = new EngineTest();

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
	    console.info("tests passed without failure");
	}
	return failedTests;
    }
};
