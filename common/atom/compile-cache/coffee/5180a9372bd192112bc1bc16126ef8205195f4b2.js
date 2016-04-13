(function() {
  var HighlightSelected, Point, Range, path, _ref;

  path = require('path');

  _ref = require('atom'), Range = _ref.Range, Point = _ref.Point;

  HighlightSelected = require('../lib/highlight-selected');

  describe("HighlightSelected", function() {
    var activationPromise, editor, editorElement, hasMinimap, highlightSelected, minimap, minimapHS, minimapModule, workspaceElement, _ref1;
    _ref1 = [], activationPromise = _ref1[0], workspaceElement = _ref1[1], minimap = _ref1[2], editor = _ref1[3], editorElement = _ref1[4], highlightSelected = _ref1[5], minimapHS = _ref1[6], minimapModule = _ref1[7];
    hasMinimap = atom.packages.getAvailablePackageNames().indexOf('minimap') !== -1 && atom.packages.getAvailablePackageNames().indexOf('minimap-highlight-selected') !== -1;
    beforeEach(function() {
      workspaceElement = atom.views.getView(atom.workspace);
      return atom.project.setPaths([path.join(__dirname, 'fixtures')]);
    });
    afterEach(function() {
      highlightSelected.deactivate();
      if (minimapHS != null) {
        minimapHS.deactivate();
      }
      return minimapModule != null ? minimapModule.deactivate() : void 0;
    });
    describe("when opening a coffee file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        if (hasMinimap) {
          waitsForPromise(function() {
            return atom.packages.activatePackage('minimap').then(function(_arg) {
              var mainModule;
              mainModule = _arg.mainModule;
              return minimapModule = mainModule;
            });
          });
          waitsForPromise(function() {
            return atom.packages.activatePackage('minimap-highlight-selected').then(function(_arg) {
              var mainModule;
              mainModule = _arg.mainModule;
              return minimapHS = mainModule;
            });
          });
        }
        waitsForPromise(function() {
          return atom.workspace.open('sample.coffee').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("updates debounce when config is changed", function() {
        beforeEach(function() {
          spyOn(highlightSelected.areaView, 'debouncedHandleSelection');
          return atom.config.set('highlight-selected.timeout', 20000);
        });
        return it('calls createDebouce', function() {
          return expect(highlightSelected.areaView.debouncedHandleSelection).toHaveBeenCalled();
        });
      });
      describe("when a whole word is selected", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 2), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("adds the decoration to all words", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
      });
      describe("when hide highlight on selected word is enabled", function() {
        beforeEach(function() {
          return atom.config.set('highlight-selected.hideHighlightOnSelectedWord', true);
        });
        describe("when a single line is selected", function() {
          beforeEach(function() {
            var range;
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the decoration only no selected words", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
          });
        });
        return describe("when multi lines are selected", function() {
          beforeEach(function() {
            var range1, range2;
            range1 = new Range(new Point(8, 2), new Point(8, 8));
            range2 = new Range(new Point(9, 2), new Point(9, 8));
            editor.setSelectedBufferRanges([range1, range2]);
            return advanceClock(20000);
          });
          return it("adds the decoration only no selected words", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
          });
        });
      });
      describe("leading whitespace doesn't get used", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(8, 0), new Point(8, 8));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will highlight non whole words", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      describe("will not highlight non whole words", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(10, 13), new Point(10, 17));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will not highlight less than minimum length", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.minimumLength', 7);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("doesn't add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(0);
        });
      });
      describe("will not highlight words in different case", function() {
        beforeEach(function() {
          var range;
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(2);
        });
      });
      describe("will highlight words in different case", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.ignoreCase', true);
          range = new Range(new Point(4, 0), new Point(4, 6));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        it("does add regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(5);
        });
        describe("adds background to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.highlightBackground', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.background .region')).toHaveLength(4);
          });
        });
        return describe("adds light theme to selected", function() {
          beforeEach(function() {
            var range;
            atom.config.set('highlight-selected.lightTheme', true);
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it("adds the background to all highlights", function() {
            return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected.light-theme .region')).toHaveLength(4);
          });
        });
      });
      if (hasMinimap) {
        return describe("minimap highlight selected still works", function() {
          beforeEach(function() {
            var range;
            editor = atom.workspace.getActiveTextEditor();
            minimap = minimapModule.minimapForEditor(editor);
            spyOn(minimap, 'decorateMarker').andCallThrough();
            range = new Range(new Point(8, 2), new Point(8, 8));
            editor.setSelectedBufferRange(range);
            return advanceClock(20000);
          });
          return it('adds a decoration for the selection in the minimap', function() {
            return expect(minimap.decorateMarker).toHaveBeenCalled();
          });
        });
      }
    });
    return describe("when opening a php file", function() {
      beforeEach(function() {
        waitsForPromise(function() {
          return atom.packages.activatePackage('highlight-selected').then(function(_arg) {
            var mainModule;
            mainModule = _arg.mainModule;
            return highlightSelected = mainModule;
          });
        });
        waitsForPromise(function() {
          return atom.workspace.open('sample.php').then(function(editor) {
            return editor;
          }, function(error) {
            throw error.stack;
          });
        });
        waitsForPromise(function() {
          return atom.packages.activatePackage('language-php');
        });
        return runs(function() {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          return editorElement = atom.views.getView(editor);
        });
      });
      describe("being able to highlight variables with '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 2), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 3 regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(3);
        });
      });
      return describe("being able to highlight variables when not selecting '$'", function() {
        beforeEach(function() {
          var range;
          atom.config.set('highlight-selected.onlyHighlightWholeWords', true);
          range = new Range(new Point(1, 3), new Point(1, 7));
          editor.setSelectedBufferRange(range);
          return advanceClock(20000);
        });
        return it("finds 4 regions", function() {
          return expect(editorElement.shadowRoot.querySelectorAll('.highlight-selected .region')).toHaveLength(4);
        });
      });
    });
  });

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL2hvbWUvanVtcC8uYXRvbS9wYWNrYWdlcy9oaWdobGlnaHQtc2VsZWN0ZWQvc3BlYy9oaWdobGlnaHQtc2VsZWN0ZWQtc3BlYy5jb2ZmZWUiCiAgXSwKICAibmFtZXMiOiBbXSwKICAibWFwcGluZ3MiOiAiQUFBQTtBQUFBLE1BQUEsMkNBQUE7O0FBQUEsRUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBUCxDQUFBOztBQUFBLEVBQ0EsT0FBaUIsT0FBQSxDQUFRLE1BQVIsQ0FBakIsRUFBQyxhQUFBLEtBQUQsRUFBUSxhQUFBLEtBRFIsQ0FBQTs7QUFBQSxFQUVBLGlCQUFBLEdBQW9CLE9BQUEsQ0FBUSwyQkFBUixDQUZwQixDQUFBOztBQUFBLEVBTUEsUUFBQSxDQUFTLG1CQUFULEVBQThCLFNBQUEsR0FBQTtBQUM1QixRQUFBLG1JQUFBO0FBQUEsSUFBQSxRQUN1RSxFQUR2RSxFQUFDLDRCQUFELEVBQW9CLDJCQUFwQixFQUFzQyxrQkFBdEMsRUFDQyxpQkFERCxFQUNTLHdCQURULEVBQ3dCLDRCQUR4QixFQUMyQyxvQkFEM0MsRUFDc0Qsd0JBRHRELENBQUE7QUFBQSxJQUdBLFVBQUEsR0FBYSxJQUFJLENBQUMsUUFBUSxDQUFDLHdCQUFkLENBQUEsQ0FDWCxDQUFDLE9BRFUsQ0FDRixTQURFLENBQUEsS0FDYyxDQUFBLENBRGQsSUFDcUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyx3QkFBZCxDQUFBLENBQ2hDLENBQUMsT0FEK0IsQ0FDdkIsNEJBRHVCLENBQUEsS0FDWSxDQUFBLENBTDlDLENBQUE7QUFBQSxJQU9BLFVBQUEsQ0FBVyxTQUFBLEdBQUE7QUFDVCxNQUFBLGdCQUFBLEdBQW1CLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBWCxDQUFtQixJQUFJLENBQUMsU0FBeEIsQ0FBbkIsQ0FBQTthQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBYixDQUFzQixD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

//# sourceURL=/home/jump/.atom/packages/highlight-selected/spec/highlight-selected-spec.coffee
