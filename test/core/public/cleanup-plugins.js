/*global cleanupPlugins */
describe('cleanupPlugins', function () {
  'use strict';

  function createFrames(callback) {
    var frame;

    frame = document.createElement('iframe');
    frame.src = '../mock/frames/nocode.html';
    frame.addEventListener('load', callback);
    fixture.appendChild(frame);
  }

  var fixture = document.getElementById('fixture');

  afterEach(function () {
    fixture.innerHTML = '';
    axe.plugins = {};
  });

  beforeEach(function () {
    axe._audit = null;
  });


  it('should throw if no audit is configured', function () {

    assert.throws(function () {
      cleanupPlugins(document, {});
    }, Error, /^No audit configured/);
  });


  it('should call cleanup on all plugins', function (done) {
    var cleaned = false;
    axe._load({
      rules: []
    });
    axe.registerPlugin({
      id: 'p',
      run: function () {},
      add: function (impl) {
        this._registry[impl.id] = impl;
      },
      commands: []
    });
    axe.plugins.p.cleanup = function (done) {
      cleaned = true;
      done();
    };
    cleanupPlugins(function () {
      assert.equal(cleaned, true);
      done();
    });
  });

  it('should send command to frames to cleanup', function (done) {
    createFrames(function () {
      axe._load({});
      var orig = utils.sendCommandToFrame;
      var frame = document.querySelector('iframe');
      utils.sendCommandToFrame = function (node, opts) {
        assert.equal(node, frame);
        assert.deepEqual(opts, {
          command: 'cleanup-plugin'
        });
        done();
      };
      cleanupPlugins();
      utils.sendCommandToFrame = orig;
    });

  });
});