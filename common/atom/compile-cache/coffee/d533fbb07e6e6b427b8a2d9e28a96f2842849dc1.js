(function() {
  var CompositeDisposable, Emitter, HighlightedAreaView, Range, StatusBarView, _, _ref,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  _ref = require('atom'), Range = _ref.Range, CompositeDisposable = _ref.CompositeDisposable, Emitter = _ref.Emitter;

  _ = require('underscore-plus');

  StatusBarView = require('./status-bar-view');

  module.exports = HighlightedAreaView = (function() {
    function HighlightedAreaView() {
      this.listenForStatusBarChange = __bind(this.listenForStatusBarChange, this);
      this.removeStatusBar = __bind(this.removeStatusBar, this);
      this.setupStatusBar = __bind(this.setupStatusBar, this);
      this.removeMarkers = __bind(this.removeMarkers, this);
      this.handleSelection = __bind(this.handleSelection, this);
      this.debouncedHandleSelection = __bind(this.debouncedHandleSelection, this);
      this.setStatusBar = __bind(this.setStatusBar, this);
      this.enable = __bind(this.enable, this);
      this.disable = __bind(this.disable, this);
      this.onDidAddMarker = __bind(this.onDidAddMarker, this);
      this.destroy = __bind(this.destroy, this);
      this.emitter = new Emitter;
      this.views = [];
      this.enable();
      this.listenForTimeoutChange();
      this.activeItemSubscription = atom.workspace.onDidChangeActivePaneItem((function(_this) {
        return function() {
          _this.debouncedHandleSelection();
          return _this.subscribeToActiveTextEditor();
        };
      })(this));
      this.subscribeToActiveTextEditor();
      this.listenForStatusBarChange();
    }

    HighlightedAreaView.prototype.destroy = function() {
      var _ref1, _ref2, _ref3;
      clearTimeout(this.handleSelectionTimeout);
      this.activeItemSubscription.dispose();
      if ((_ref1 = this.selectionSubscription) != null) {
        _ref1.dispose();
      }
      if ((_ref2 = this.statusBarView) != null) {
        _ref2.removeElement();
      }
      if ((_ref3 = this.statusBarTile) != null) {
        _ref3.destroy();
      }
      return this.statusBarTile = null;
    };

    HighlightedAreaView.prototype.onDidAddMarker = function(callback) {
      return this.emitter.on('did-add-marker', callback);
    };

    HighlightedAreaView.prototype.disable = function() {
      this.disabled = true;
      return this.removeMarkers();
    };

    HighlightedAreaView.prototype.enable = function() {
      this.disabled = false;
      return this.debouncedHandleSelection();
    };

    HighlightedAreaView.prototype.setStatusBar = function(statusBar) {
      this.statusBar = statusBar;
      return this.setupStatusBar();
    };

    HighlightedAreaView.prototype.debouncedHandleSelection = function() {
      clearTimeout(this.handleSelectionTimeout);
      return this.handleSelectionTimeout = setTimeout((function(_this) {
        return function() {
          return _this.handleSelection();
        };
      })(this), atom.config.get('highlight-selected.timeout'));
    };

    HighlightedAreaView.prototype.listenForTimeoutChange = function() {
      return atom.config.onDidChange('highlight-selected.timeout', (function(_this) {
        return function() {
          return _this.debouncedHandleSelection();
        };
      })(this));
    };

    HighlightedAreaView.prototype.subscribeToActiveTextEditor = function() {
      var editor, _ref1;
      if ((_ref1 = this.selectionSubscription) != null) {
        _ref1.dispose();
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      this.selectionSubscription = new CompositeDisposable;
      this.selectionSubscription.add(editor.onDidAddSelection(this.debouncedHandleSelection));
      this.selectionSubscription.add(editor.onDidChangeSelectionRange(this.debouncedHandleSelection));
      return this.handleSelection();
    };

    HighlightedAreaView.prototype.getActiveEditor = function() {
      return atom.workspace.getActiveTextEditor();
    };

    HighlightedAreaView.prototype.handleSelection = function() {
      var editor, range, regex, regexFlags, regexSearch, result, resultCount, text, _ref1, _ref2;
      this.removeMarkers();
      if (this.disabled) {
        return;
      }
      editor = this.getActiveEditor();
      if (!editor) {
        return;
      }
      if (editor.getLastSelection().isEmpty()) {
        return;
      }
      if (!this.isWordSelected(editor.getLastSelection())) {
        return;
      }
      this.selections = editor.getSelections();
      text = _.escapeRegExp(this.selections[0].getText());
      regex = new RegExp("\\S*\\w*\\b", 'gi');
      result = regex.exec(text);
      if (result == null) {
        return;
      }
      if (result[0].length < atom.config.get('highlight-selected.minimumLength') || result.index !== 0 || result[0] !== result.input) {
        return;
      }
      regexFlags = 'g';
      if (atom.config.get('highlight-selected.ignoreCase')) {
        regexFlags = 'gi';
      }
      range = [[0, 0], editor.getEofBufferPosition()];
      this.ranges = [];
      regexSearch = result[0];
      if (atom.config.get('highlight-selected.onlyHighlightWholeWords')) {
        if (regexSearch.indexOf("\$") !== -1 && ((_ref1 = editor.getGrammar()) != null ? _ref1.name : void 0) === 'PHP') {
          regexSearch = regexSearch.replace("\$", "\$\\b");
        } else {
          regexSearch = "\\b" + regexSearch;
        }
        regexSearch = regexSearch + "\\b";
      }
      resultCount = 0;
      editor.scanInBufferRange(new RegExp(regexSearch, regexFlags), range, (function(_this) {
        return function(result) {
          var decoration, marker;
          resultCount += 1;
          if (!_this.showHighlightOnSelectedWord(result.range, _this.selections)) {
            marker = editor.markBufferRange(result.range);
            decoration = editor.decorateMarker(marker, {
              type: 'highlight',
              "class": _this.makeClasses()
            });
            _this.views.push(marker);
            return _this.emitter.emit('did-add-marker', marker);
          }
        };
      })(this));
      return (_ref2 = this.statusBarElement) != null ? _ref2.updateCount(resultCount) : void 0;
    };

    HighlightedAreaView.prototype.makeClasses = function() {
      var className;
      className = 'highlight-selected';
      if (atom.config.get('highlight-selected.lightTheme')) {
        className += ' light-theme';
      }
      if (atom.config.get('highlight-selected.highlightBackground')) {
        className += ' background';
      }
      return className;
    };

    HighlightedAreaView.prototype.showHighlightOnSelectedWord = function(range, selections) {
      var outcome, selection, selectionRange, _i, _len;
      if (!atom.config.get('highlight-selected.hideHighlightOnSelectedWord')) {
        return false;
      }
      outcome = false;
      for (_i = 0, _len = selections.length; _i < _len; _i++) {
        selection = selections[_i];
        selectionRange = selection.getBufferRange();
        outcome = (range.start.column === selectionRange.start.column) && (range.start.row === selectionRange.start.row) && (range.end.column === selectionRange.end.column) && (range.end.row === selectionRange.end.row);
        if (outcome) {
          break;
        }
      }
      return outcome;
    };

    HighlightedAreaView.prototype.removeMarkers = function() {
      var view, _i, _len, _ref1, _ref2;
      if (this.views == null) {
        return;
      }
      if (this.views.length === 0) {
        return;
      }
      _ref1 = this.views;
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        view = _ref1[_i];
        view.destroy();
        view = null;
      }
      this.views = [];
      return (_ref2 = this.statusBarElement) != null ? _ref2.updateCount(this.views.length) : void 0;
    };

    HighlightedAreaView.prototype.isWordSelected = function(selection) {
      var lineRange, nonWordCharacterToTheLeft, nonWordCharacterToTheRight, selectionRange;
      if (selection.getBufferRange().isSingleLine()) {
        selectionRange = selection.getBufferRange();
        lineRange = this.getActiveEditor().bufferRangeForBufferRow(selectionRange.start.row);
        nonWordCharacterToTheLeft = _.isEqual(selectionRange.start, lineRange.start) || this.isNonWordCharacterToTheLeft(selection);
        nonWordCharacterToTheRight = _.isEqual(selectionRange.end, lineRange.end) || this.isNonWordCharacterToTheRight(selection);
        return nonWordCharacterToTheLeft && nonWordCharacterToTheRight;
      } else {
        return false;
      }
    };

    HighlightedAreaView.prototype.isNonWordCharacter = function(character) {
      var nonWordCharacters;
      nonWordCharacters = atom.config.get('editor.nonWordCharacters');
      return new RegExp("[ \t" + (_.escapeRegExp(nonWordCharacters)) + "]").test(character);
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheLeft = function(selection) {
      var range, selectionStart;
      selectionStart = selection.getBufferRange().start;
      range = Range.fromPointWithDelta(selectionStart, 0, -1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.isNonWordCharacterToTheRight = function(selection) {
      var range, selectionEnd;
      selectionEnd = selection.getBufferRange().end;
      range = Range.fromPointWithDelta(selectionEnd, 0, 1);
      return this.isNonWordCharacter(this.getActiveEditor().getTextInBufferRange(range));
    };

    HighlightedAreaView.prototype.setupStatusBar = function() {
      if (this.statusBarElement != null) {
        return;
      }
      if (!atom.config.get('highlight-selected.showInStatusBar')) {
        return;
      }
      this.statusBarElement = new StatusBarView();
      return this.statusBarTile = this.statusBar.addLeftTile({
        item: this.statusBarElement.getElement(),
        priority: 100
      });
    };

    HighlightedAreaView.prototype.removeStatusBar = function() {
      var _ref1;
      if (this.statusBarElement == null) {
        return;
      }
      if ((_ref1 = this.statusBarTile) != null) {
        _ref1.destroy();
      }
      this.statusBarTile = null;
      return this.statusBarElement = null;
    };

    HighlightedAreaView.prototype.listenForStatusBarChange = function() {
      return atom.config.onDidChange('highlight-selected.showInStatusBar', (function(_this) {
        return function(changed) {
          if (changed.newValue) {
            return _this.setupStatusBar();
          } else {
            return _this.removeStatusBar();
          }
        };
      })(this));
    };

    return HighlightedAreaView;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVtcC8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtc2VsZWN0ZWQvbGliL2hpZ2hsaWdodGVkLWFyZWEtdmlldy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsZ0ZBQUE7SUFBQSxrRkFBQTs7QUFBQSxFQUFBLE9BQXdDLE9BQUEsQ0FBUSxNQUFSLENBQXhDLEVBQUMsYUFBQSxLQUFELEVBQVEsMkJBQUEsbUJBQVIsRUFBNkIsZUFBQSxPQUE3QixDQUFBOztBQUFBLEVBQ0EsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxpQkFBUixDQURKLENBQUE7O0FBQUEsRUFFQSxhQUFBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUixDQUZoQixDQUFBOztBQUFBLEVBSUEsTUFBTSxDQUFDLE9BQVAsR0FDTTtBQUVTLElBQUEsNkJBQUEsR0FBQTtBQUNYLGlGQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsNkRBQUEsQ0FBQTtBQUFBLDJEQUFBLENBQUE7QUFBQSwrREFBQSxDQUFBO0FBQUEsaUZBQUEsQ0FBQTtBQUFBLHlEQUFBLENBQUE7QUFBQSw2Q0FBQSxDQUFBO0FBQUEsK0NBQUEsQ0FBQTtBQUFBLDZEQUFBLENBQUE7QUFBQSwrQ0FBQSxDQUFBO0FBQUEsTUFBQSxJQUFDLENBQUEsT0FBRCxHQUFXLEdBQUEsQ0FBQSxPQUFYLENBQUE7QUFBQSxNQUNBLElBQUMsQ0FBQSxLQUFELEdBQVMsRUFEVCxDQUFBO0FBQUEsTUFFQSxJQUFDLENBQUEsTUFBRCxDQUFBLENBRkEsQ0FBQTtBQUFBLE1BR0EsSUFBQyxDQUFBLHNCQUFELENBQUEsQ0FIQSxDQUFBO0FBQUEsTUFJQSxJQUFDLENBQUEsc0JBQUQsR0FBMEIsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBZixDQUF5QyxDQUFBLFNBQUEsS0FBQSxHQUFBO2VBQUEsU0FBQSxH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

//# sourceURL=/home/jump/.atom/packages/highlight-selected/lib/highlighted-area-view.coffee
