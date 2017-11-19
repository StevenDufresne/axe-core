var testUtils = {};

/**
 * Create a check context for mocking/resetting data and relatedNodes in tests
 *
 * @return Object
 */
testUtils.MockCheckContext = function () {
	'use strict';
	return {
		_relatedNodes: [],
		_data: null,
		data: function (d) {
			this._data = d;
		},
		relatedNodes: function (rn) {
			this._relatedNodes = rn;
		},
		reset: function () {
			this._data = null;
			this._relatedNodes = [];
		}
	};
};

/**
 * Method for injecting content into a fixture
 *
 * @param Node|String 	Stuff to go into the fixture (html or DOM node)
 * @return HTMLElement
 */
testUtils.fixtureSetup = function (content) {
	'use strict';
	var fixture = document.querySelector('#fixture');
	if (typeof content === 'string') {
		fixture.innerHTML = content;
	} else if (content instanceof Node) {
		fixture.appendChild(content);
	}
	return fixture;
};


/**
 * Create check arguments with Shadow DOM
 *
 * @param Node|String 	Stuff to go into the fixture (html or node)
 * @param Node|String 	Stuff to go into the shadow boundary (html or node)
 * @param Object  			Options argument for the check (optional, default: {})
 * @param String  			Target for the check, CSS selector (default: '#target')
 * @return Array
 */
testUtils.shadowCheckSetup = function (content, shadowContent, options, target) {
	'use strict';
	// Normalize the params
	if (typeof options !== 'object') {
		target = options;
		options = {};
	}
	// Normalize target, allow it to be the inserted node or '#target'
	target = target || (content instanceof Node ? content : '#target');
	testUtils.fixtureSetup(content);
	
	// wrap contents in a DIV to make it easy to attach a shadow
	// ensure we attach it to the target, and not the outer fixture
	var fixture = document.querySelector(target);
	if (typeof shadowContent === 'string') {
		fixture.innerHTML = '<div id="shadowHost"></div>';
	} else if (content instanceof Node) {
		var shadowHost = document.createElement('div');
		shadowHost.setAttribute('id', 'shadowHost');
		fixture.appendChild(shadowHost);
	}

	// attach a shadowRoot with the content provided
	var shadowRoot = fixture.querySelector('#shadowHost').attachShadow({ mode: 'open' });
	shadowRoot.innerHTML = shadowContent;

	// query the composed tree AFTER shadowDOM has been attached
	axe._tree = axe.utils.getFlattenedTree(fixture);
	var node;
	if (typeof target === 'string') {
		node = axe.utils.querySelectorAll(axe._tree[0], target)[0];
	} else if (target instanceof Node) {
		node = axe.utils.getNodeFromTree(axe._tree[0], target);
	} else {
		node = target;
	}
	return [node.actualNode, options, node];
};


axe.testUtils = testUtils;