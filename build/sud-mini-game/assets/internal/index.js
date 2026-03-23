System.register("chunks:///_virtual/debug-view-runtime-control.js", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _applyDecoratedDescriptor, _inherits, _createClass, _classCallCheck, _callSuper, _initializerDefineProperty, _defineProperty, cclegacy, _decorator, Node, Canvas, UITransform, instantiate, Label, Color, RichText, Toggle, Button, director, Component;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inherits = module.inherits;
      _createClass = module.createClass;
      _classCallCheck = module.classCallCheck;
      _callSuper = module.callSuper;
      _initializerDefineProperty = module.initializerDefineProperty;
      _defineProperty = module.defineProperty;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      Canvas = module.Canvas;
      UITransform = module.UITransform;
      instantiate = module.instantiate;
      Label = module.Label;
      Color = module.Color;
      RichText = module.RichText;
      Toggle = module.Toggle;
      Button = module.Button;
      director = module.director;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
      cclegacy._RF.push({}, "b2bd1+njXxJxaFY3ymm06WU", "debug-view-runtime-control", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var DebugViewRuntimeControl = exports('DebugViewRuntimeControl', (_dec = ccclass('internal.DebugViewRuntimeControl'), _dec2 = property(Node), _dec3 = property(Node), _dec4 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        function DebugViewRuntimeControl() {
          var _this;
          _classCallCheck(this, DebugViewRuntimeControl);
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _callSuper(this, DebugViewRuntimeControl, [].concat(args));
          _initializerDefineProperty(_this, "compositeModeToggle", _descriptor, _this);
          _initializerDefineProperty(_this, "singleModeToggle", _descriptor2, _this);
          _initializerDefineProperty(_this, "EnableAllCompositeModeButton", _descriptor3, _this);
          _defineProperty(_this, "_single", 0);
          _defineProperty(_this, "strSingle", ['No Single Debug', 'Vertex Color', 'Vertex Normal', 'Vertex Tangent', 'World Position', 'Vertex Mirror', 'Face Side', 'UV0', 'UV1', 'UV Lightmap', 'Project Depth', 'Linear Depth', 'Fragment Normal', 'Fragment Tangent', 'Fragment Binormal', 'Base Color', 'Diffuse Color', 'Specular Color', 'Transparency', 'Metallic', 'Roughness', 'Specular Intensity', 'IOR', 'Direct Diffuse', 'Direct Specular', 'Direct All', 'Env Diffuse', 'Env Specular', 'Env All', 'Emissive', 'Light Map', 'Shadow', 'AO', 'Fresnel', 'Direct Transmit Diffuse', 'Direct Transmit Specular', 'Env Transmit Diffuse', 'Env Transmit Specular', 'Transmit All', 'Direct Internal Specular', 'Env Internal Specular', 'Internal All', 'Fog']);
          _defineProperty(_this, "strComposite", ['Direct Diffuse', 'Direct Specular', 'Env Diffuse', 'Env Specular', 'Emissive', 'Light Map', 'Shadow', 'AO', 'Normal Map', 'Fog', 'Tone Mapping', 'Gamma Correction', 'Fresnel', 'Transmit Diffuse', 'Transmit Specular', 'Internal Specular', 'TT']);
          _defineProperty(_this, "strMisc", ['CSM Layer Coloration', 'Lighting With Albedo']);
          _defineProperty(_this, "compositeModeToggleList", []);
          _defineProperty(_this, "singleModeToggleList", []);
          _defineProperty(_this, "miscModeToggleList", []);
          _defineProperty(_this, "textComponentList", []);
          _defineProperty(_this, "labelComponentList", []);
          _defineProperty(_this, "textContentList", []);
          _defineProperty(_this, "hideButtonLabel", void 0);
          _defineProperty(_this, "_currentColorIndex", 0);
          _defineProperty(_this, "strColor", ['<color=#ffffff>', '<color=#000000>', '<color=#ff0000>', '<color=#00ff00>', '<color=#0000ff>']);
          _defineProperty(_this, "color", [Color.WHITE, Color.BLACK, Color.RED, Color.GREEN, Color.BLUE]);
          return _this;
        }
        _inherits(DebugViewRuntimeControl, _Component);
        return _createClass(DebugViewRuntimeControl, [{
          key: "start",
          value: function start() {
            // get canvas resolution
            var canvas = this.node.parent.getComponent(Canvas);
            if (!canvas) {
              console.error('debug-view-runtime-control should be child of Canvas');
              return;
            }
            var uiTransform = this.node.parent.getComponent(UITransform);
            var halfScreenWidth = uiTransform.width * 0.5;
            var halfScreenHeight = uiTransform.height * 0.5;
            var x = -halfScreenWidth + halfScreenWidth * 0.1,
              y = halfScreenHeight - halfScreenHeight * 0.1;
            var width = 200,
              height = 20;

            // new nodes
            var miscNode = this.node.getChildByName('MiscMode');
            var buttonNode = instantiate(miscNode);
            buttonNode.parent = this.node;
            buttonNode.name = 'Buttons';
            var titleNode = instantiate(miscNode);
            titleNode.parent = this.node;
            titleNode.name = 'Titles';

            // title
            for (var i = 0; i < 2; i++) {
              var newLabel = instantiate(this.EnableAllCompositeModeButton.getChildByName('Label'));
              newLabel.setPosition(x + (i > 0 ? 50 + width * 2 : 150), y, 0.0);
              newLabel.setScale(0.75, 0.75, 0.75);
              newLabel.parent = titleNode;
              var _labelComponent = newLabel.getComponent(Label);
              _labelComponent.string = i ? '----------Composite Mode----------' : '----------Single Mode----------';
              _labelComponent.color = Color.WHITE;
              _labelComponent.overflow = 0;
              this.labelComponentList[this.labelComponentList.length] = _labelComponent;
            }
            y -= height;
            // single
            var currentRow = 0;
            for (var _i = 0; _i < this.strSingle.length; _i++, currentRow++) {
              if (_i === this.strSingle.length >> 1) {
                x += width;
                currentRow = 0;
              }
              var newNode = _i ? instantiate(this.singleModeToggle) : this.singleModeToggle;
              newNode.setPosition(x, y - height * currentRow, 0.0);
              newNode.setScale(0.5, 0.5, 0.5);
              newNode.parent = this.singleModeToggle.parent;
              var textComponent = newNode.getComponentInChildren(RichText);
              textComponent.string = this.strSingle[_i];
              this.textComponentList[this.textComponentList.length] = textComponent;
              this.textContentList[this.textContentList.length] = textComponent.string;
              newNode.on(Toggle.EventType.TOGGLE, this.toggleSingleMode, this);
              this.singleModeToggleList[_i] = newNode;
            }
            x += width;
            // buttons
            this.EnableAllCompositeModeButton.setPosition(x + 15, y, 0.0);
            this.EnableAllCompositeModeButton.setScale(0.5, 0.5, 0.5);
            this.EnableAllCompositeModeButton.on(Button.EventType.CLICK, this.enableAllCompositeMode, this);
            this.EnableAllCompositeModeButton.parent = buttonNode;
            var labelComponent = this.EnableAllCompositeModeButton.getComponentInChildren(Label);
            this.labelComponentList[this.labelComponentList.length] = labelComponent;
            var changeColorButton = instantiate(this.EnableAllCompositeModeButton);
            changeColorButton.setPosition(x + 90, y, 0.0);
            changeColorButton.setScale(0.5, 0.5, 0.5);
            changeColorButton.on(Button.EventType.CLICK, this.changeTextColor, this);
            changeColorButton.parent = buttonNode;
            labelComponent = changeColorButton.getComponentInChildren(Label);
            labelComponent.string = 'TextColor';
            this.labelComponentList[this.labelComponentList.length] = labelComponent;
            var HideButton = instantiate(this.EnableAllCompositeModeButton);
            HideButton.setPosition(x + 200, y, 0.0);
            HideButton.setScale(0.5, 0.5, 0.5);
            HideButton.on(Button.EventType.CLICK, this.hideUI, this);
            HideButton.parent = this.node.parent;
            labelComponent = HideButton.getComponentInChildren(Label);
            labelComponent.string = 'Hide UI';
            this.labelComponentList[this.labelComponentList.length] = labelComponent;
            this.hideButtonLabel = labelComponent;

            // misc
            y -= 40;
            for (var _i2 = 0; _i2 < this.strMisc.length; _i2++) {
              var _newNode = instantiate(this.compositeModeToggle);
              _newNode.setPosition(x, y - height * _i2, 0.0);
              _newNode.setScale(0.5, 0.5, 0.5);
              _newNode.parent = miscNode;
              var _textComponent = _newNode.getComponentInChildren(RichText);
              _textComponent.string = this.strMisc[_i2];
              this.textComponentList[this.textComponentList.length] = _textComponent;
              this.textContentList[this.textContentList.length] = _textComponent.string;
              var toggleComponent = _newNode.getComponent(Toggle);
              toggleComponent.isChecked = _i2 ? true : false;
              _newNode.on(Toggle.EventType.TOGGLE, _i2 ? this.toggleLightingWithAlbedo : this.toggleCSMColoration, this);
              this.miscModeToggleList[_i2] = _newNode;
            }

            // composite
            y -= 150;
            for (var _i3 = 0; _i3 < this.strComposite.length; _i3++) {
              var _newNode2 = _i3 ? instantiate(this.compositeModeToggle) : this.compositeModeToggle;
              _newNode2.setPosition(x, y - height * _i3, 0.0);
              _newNode2.setScale(0.5, 0.5, 0.5);
              _newNode2.parent = this.compositeModeToggle.parent;
              var _textComponent2 = _newNode2.getComponentInChildren(RichText);
              _textComponent2.string = this.strComposite[_i3];
              this.textComponentList[this.textComponentList.length] = _textComponent2;
              this.textContentList[this.textContentList.length] = _textComponent2.string;
              _newNode2.on(Toggle.EventType.TOGGLE, this.toggleCompositeMode, this);
              this.compositeModeToggleList[_i3] = _newNode2;
            }
          }
        }, {
          key: "isTextMatched",
          value: function isTextMatched(textUI, textDescription) {
            var tempText = new String(textUI);
            var findIndex = tempText.search('>');
            if (findIndex === -1) {
              return textUI === textDescription;
            } else {
              tempText = tempText.substr(findIndex + 1);
              tempText = tempText.substr(0, tempText.search('<'));
              return tempText === textDescription;
            }
          }
        }, {
          key: "toggleSingleMode",
          value: function toggleSingleMode(toggle) {
            var debugView = director.root.debugView;
            var textComponent = toggle.getComponentInChildren(RichText);
            for (var i = 0; i < this.strSingle.length; i++) {
              if (this.isTextMatched(textComponent.string, this.strSingle[i])) {
                debugView.singleMode = i;
              }
            }
          }
        }, {
          key: "toggleCompositeMode",
          value: function toggleCompositeMode(toggle) {
            var debugView = director.root.debugView;
            var textComponent = toggle.getComponentInChildren(RichText);
            for (var i = 0; i < this.strComposite.length; i++) {
              if (this.isTextMatched(textComponent.string, this.strComposite[i])) {
                debugView.enableCompositeMode(i, toggle.isChecked);
              }
            }
          }
        }, {
          key: "toggleLightingWithAlbedo",
          value: function toggleLightingWithAlbedo(toggle) {
            var debugView = director.root.debugView;
            debugView.lightingWithAlbedo = toggle.isChecked;
          }
        }, {
          key: "toggleCSMColoration",
          value: function toggleCSMColoration(toggle) {
            var debugView = director.root.debugView;
            debugView.csmLayerColoration = toggle.isChecked;
          }
        }, {
          key: "enableAllCompositeMode",
          value: function enableAllCompositeMode(button) {
            var debugView = director.root.debugView;
            debugView.enableAllCompositeMode(true);
            for (var i = 0; i < this.compositeModeToggleList.length; i++) {
              var _toggleComponent = this.compositeModeToggleList[i].getComponent(Toggle);
              _toggleComponent.isChecked = true;
            }
            var toggleComponent = this.miscModeToggleList[0].getComponent(Toggle);
            toggleComponent.isChecked = false;
            debugView.csmLayerColoration = false;
            toggleComponent = this.miscModeToggleList[1].getComponent(Toggle);
            toggleComponent.isChecked = true;
            debugView.lightingWithAlbedo = true;
          }
        }, {
          key: "hideUI",
          value: function hideUI(button) {
            var titleNode = this.node.getChildByName('Titles');
            var activeValue = !titleNode.active;
            this.singleModeToggleList[0].parent.active = activeValue;
            this.miscModeToggleList[0].parent.active = activeValue;
            this.compositeModeToggleList[0].parent.active = activeValue;
            this.EnableAllCompositeModeButton.parent.active = activeValue;
            titleNode.active = activeValue;
            this.hideButtonLabel.string = activeValue ? 'Hide UI' : 'Show UI';
          }
        }, {
          key: "changeTextColor",
          value: function changeTextColor(button) {
            this._currentColorIndex++;
            if (this._currentColorIndex >= this.strColor.length) {
              this._currentColorIndex = 0;
            }
            for (var i = 0; i < this.textComponentList.length; i++) {
              this.textComponentList[i].string = this.strColor[this._currentColorIndex] + this.textContentList[i] + '</color>';
            }
            for (var _i4 = 0; _i4 < this.labelComponentList.length; _i4++) {
              this.labelComponentList[_i4].color = this.color[this._currentColorIndex];
            }
          }
        }, {
          key: "onLoad",
          value: function onLoad() {}
        }, {
          key: "update",
          value: function update(deltaTime) {}
        }]);
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "compositeModeToggle", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "singleModeToggle", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "EnableAllCompositeModeButton", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/internal.js", ['./debug-view-runtime-control.js'], function () {
  return {
    setters: [null],
    execute: function () {}
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/internal', 'chunks:///_virtual/internal.js'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL2ZpbGU6L0M6L1VzZXJzL0FkbWluaXN0cmF0b3IvQXBwRGF0YS9Sb2FtaW5nL2NvY29zLWRlZmF1bHQvY29jb3MtNC4wLjAtYWxwaGEuMy9wYWNrYWdlcy9lbmdpbmUvZWRpdG9yL2Fzc2V0cy90b29scy9maWxlOi9DOi9Vc2Vycy9BZG1pbmlzdHJhdG9yL0FwcERhdGEvUm9hbWluZy9jb2Nvcy1kZWZhdWx0L2NvY29zLTQuMC4wLWFscGhhLjMvcGFja2FnZXMvZW5naW5lL2VkaXRvci9hc3NldHMvdG9vbHMvZGVidWctdmlldy1ydW50aW1lLWNvbnRyb2wudHMiXSwibmFtZXMiOlsiY2NjbGFzcyIsIl9kZWNvcmF0b3IiLCJwcm9wZXJ0eSIsIkRlYnVnVmlld1J1bnRpbWVDb250cm9sIiwiX2RlYyIsIl9kZWMyIiwiTm9kZSIsIl9kZWMzIiwiX2RlYzQiLCJfY2xhc3MiLCJfY2xhc3MyIiwiX0NvbXBvbmVudCIsIl90aGlzIiwiX2NsYXNzQ2FsbENoZWNrIiwiX2xlbiIsImFyZ3VtZW50cyIsImxlbmd0aCIsImFyZ3MiLCJBcnJheSIsIl9rZXkiLCJfY2FsbFN1cGVyIiwiY29uY2F0IiwiX2luaXRpYWxpemVyRGVmaW5lUHJvcGVydHkiLCJfZGVzY3JpcHRvciIsIl9kZXNjcmlwdG9yMiIsIl9kZXNjcmlwdG9yMyIsIl9kZWZpbmVQcm9wZXJ0eSIsIkNvbG9yIiwiV0hJVEUiLCJCTEFDSyIsIlJFRCIsIkdSRUVOIiwiQkxVRSIsIl9pbmhlcml0cyIsIl9jcmVhdGVDbGFzcyIsImtleSIsInZhbHVlIiwic3RhcnQiLCJjYW52YXMiLCJub2RlIiwicGFyZW50IiwiZ2V0Q29tcG9uZW50IiwiQ2FudmFzIiwiY29uc29sZSIsImVycm9yIiwidWlUcmFuc2Zvcm0iLCJVSVRyYW5zZm9ybSIsImhhbGZTY3JlZW5XaWR0aCIsIndpZHRoIiwiaGFsZlNjcmVlbkhlaWdodCIsImhlaWdodCIsIngiLCJ5IiwibWlzY05vZGUiLCJnZXRDaGlsZEJ5TmFtZSIsImJ1dHRvbk5vZGUiLCJpbnN0YW50aWF0ZSIsIm5hbWUiLCJ0aXRsZU5vZGUiLCJpIiwibmV3TGFiZWwiLCJFbmFibGVBbGxDb21wb3NpdGVNb2RlQnV0dG9uIiwic2V0UG9zaXRpb24iLCJzZXRTY2FsZSIsImxhYmVsQ29tcG9uZW50IiwiTGFiZWwiLCJzdHJpbmciLCJjb2xvciIsIm92ZXJmbG93IiwibGFiZWxDb21wb25lbnRMaXN0IiwiY3VycmVudFJvdyIsInN0clNpbmdsZSIsIm5ld05vZGUiLCJzaW5nbGVNb2RlVG9nZ2xlIiwidGV4dENvbXBvbmVudCIsImdldENvbXBvbmVudEluQ2hpbGRyZW4iLCJSaWNoVGV4dCIsInRleHRDb21wb25lbnRMaXN0IiwidGV4dENvbnRlbnRMaXN0Iiwib24iLCJUb2dnbGUiLCJFdmVudFR5cGUiLCJUT0dHTEUiLCJ0b2dnbGVTaW5nbGVNb2RlIiwic2luZ2xlTW9kZVRvZ2dsZUxpc3QiLCJCdXR0b24iLCJDTElDSyIsImVuYWJsZUFsbENvbXBvc2l0ZU1vZGUiLCJjaGFuZ2VDb2xvckJ1dHRvbiIsImNoYW5nZVRleHRDb2xvciIsIkhpZGVCdXR0b24iLCJoaWRlVUkiLCJoaWRlQnV0dG9uTGFiZWwiLCJzdHJNaXNjIiwiY29tcG9zaXRlTW9kZVRvZ2dsZSIsInRvZ2dsZUNvbXBvbmVudCIsImlzQ2hlY2tlZCIsInRvZ2dsZUxpZ2h0aW5nV2l0aEFsYmVkbyIsInRvZ2dsZUNTTUNvbG9yYXRpb24iLCJtaXNjTW9kZVRvZ2dsZUxpc3QiLCJzdHJDb21wb3NpdGUiLCJ0b2dnbGVDb21wb3NpdGVNb2RlIiwiY29tcG9zaXRlTW9kZVRvZ2dsZUxpc3QiLCJpc1RleHRNYXRjaGVkIiwidGV4dFVJIiwidGV4dERlc2NyaXB0aW9uIiwidGVtcFRleHQiLCJTdHJpbmciLCJmaW5kSW5kZXgiLCJzZWFyY2giLCJzdWJzdHIiLCJ0b2dnbGUiLCJkZWJ1Z1ZpZXciLCJkaXJlY3RvciIsInJvb3QiLCJzaW5nbGVNb2RlIiwiZW5hYmxlQ29tcG9zaXRlTW9kZSIsImxpZ2h0aW5nV2l0aEFsYmVkbyIsImNzbUxheWVyQ29sb3JhdGlvbiIsImJ1dHRvbiIsImFjdGl2ZVZhbHVlIiwiYWN0aXZlIiwiX2N1cnJlbnRDb2xvckluZGV4Iiwic3RyQ29sb3IiLCJvbkxvYWQiLCJ1cGRhdGUiLCJkZWx0YVRpbWUiLCJDb21wb25lbnQiLCJfYXBwbHlEZWNvcmF0ZWREZXNjcmlwdG9yIiwicHJvdG90eXBlIiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsIndyaXRhYmxlIiwiaW5pdGlhbGl6ZXIiLCJfY2NsZWdhY3kiLCJfUkYiLCJwb3AiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BQ0EsSUFBUUEsT0FBTyxHQUFlQyxVQUFVLENBQWhDRCxPQUFPO1FBQUVFLFFBQVEsR0FBS0QsVUFBVSxDQUF2QkMsUUFBUTtNQUV6QixJQUNhQyx1QkFBdUIsR0FBQUMsT0FBQUEsQ0FBQUEseUJBQUFBLEdBQUFBLElBQUEsR0FEbkNKLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFBSyxLQUFBLEdBRXZDSCxRQUFRLENBQUNJLElBQUksQ0FBQyxFQUFBQyxLQUFBLEdBRWRMLFFBQVEsQ0FBQ0ksSUFBSSxDQUFDLEVBQUFFLEtBQUEsR0FFZE4sUUFBUSxDQUFDSSxJQUFJLENBQUMsRUFBQUYsSUFBQSxDQUFBSyxNQUFBLElBQUFDLE9BQUEsMEJBQUFDLFVBQUEsRUFBQTtRQUFBLFNBQUFSLHVCQUFBQSxDQUFBLEVBQUE7VUFBQSxJQUFBUyxLQUFBO1VBQUFDLGVBQUEsT0FBQVYsdUJBQUEsQ0FBQTtVQUFBLEtBQUEsSUFBQVcsSUFBQSxHQUFBQyxTQUFBLENBQUFDLE1BQUEsRUFBQUMsSUFBQSxHQUFBQyxJQUFBQSxLQUFBLENBQUFKLElBQUEsR0FBQUssSUFBQSxHQUFBLENBQUEsRUFBQUEsSUFBQSxHQUFBTCxJQUFBLEVBQUFLLElBQUEsRUFBQSxFQUFBO1lBQUFGLElBQUEsQ0FBQUUsSUFBQSxDQUFBSixHQUFBQSxTQUFBLENBQUFJLElBQUEsQ0FBQTtVQUFBO1VB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QUEsQ0FBQTtNQUFBLENBeFR3Q0MsQ0FBQUEsU0FBUyxDQUFBeEcsRUFBQUEsV0FBQSxHQUFBeUcseUJBQUEsQ0FBQXRILE9BQUEsQ0FBQXVILFNBQUEsRUFBQSxxQkFBQSxFQUFBLENBQUE1SCxLQUFBLENBQUEsRUFBQTtRQUFBNkgsWUFBQSxFQUFBLElBQUE7UUFBQUMsVUFBQSxFQUFBLElBQUE7UUFBQUMsUUFBQSxFQUFBLElBQUE7UUFBQUMsV0FBQSxXQUFBQSxXQUFBQSxDQUFBLEVBQUE7VUFBQSxPQUVmLElBQUk7UUFBQTtNQUFBLENBQUE3RyxDQUFBQSxFQUFBQSxZQUFBLEdBQUF3Ryx5QkFBQSxDQUFBdEgsT0FBQSxDQUFBdUgsU0FBQSx1QkFBQTFILEtBQUEsQ0FBQSxFQUFBO1FBQUEySCxZQUFBLEVBQUEsSUFBQTtRQUFBQyxVQUFBLEVBQUEsSUFBQTtRQUFBQyxRQUFBLEVBQUEsSUFBQTtRQUFBQyxXQUFBLFdBQUFBLFdBQUFBLENBQUEsRUFBQTtVQUFBLE9BRVAsSUFBSTtRQUFBO01BQUEsQ0FBQTVHLENBQUFBLEVBQUFBLFlBQUEsR0FBQXVHLHlCQUFBLENBQUF0SCxPQUFBLENBQUF1SCxTQUFBLG1DQUFBekgsS0FBQSxDQUFBLEVBQUE7UUFBQTBILFlBQUEsRUFBQSxJQUFBO1FBQUFDLFVBQUEsRUFBQSxJQUFBO1FBQUFDLFFBQUEsRUFBQSxJQUFBO1FBQUFDLFdBQUEsV0FBQUEsV0FBQUEsQ0FBQSxFQUFBO1VBQUEsT0FFUSxJQUFJO1FBQUE7TUFBQSxDQUFBM0gsQ0FBQUEsRUFBQUEsT0FBQSxNQUFBRCxNQUFBLENBQUEsQ0FBQTtNQW1UbkQ2SCxRQUFBLENBQUFDLEdBQUEsQ0FBQUMsR0FBQSxDQUFBLENBQUEiLCJmaWxlIjoiYWxsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sb3IsIENhbnZhcywgVUlUcmFuc2Zvcm0sIGluc3RhbnRpYXRlLCBtYXRoLCBUb2dnbGUsIFRleHR1cmVDdWJlLCBfZGVjb3JhdG9yLCBDb21wb25lbnQsIEJ1dHRvbiwgbGFiZWxBc3NlbWJsZXIsIGdhbWUsIGRpcmVjdG9yLCBOb2RlLCBTY2VuZSwgcmVuZGVyZXIsIENhbWVyYUNvbXBvbmVudCwgTGFiZWwsIEZvcndhcmRQaXBlbGluZSwgUmljaFRleHQgfSBmcm9tICdjYyc7XHJcbmNvbnN0IHsgY2NjbGFzcywgcHJvcGVydHkgfSA9IF9kZWNvcmF0b3I7XHJcblxyXG5AY2NjbGFzcygnaW50ZXJuYWwuRGVidWdWaWV3UnVudGltZUNvbnRyb2wnKVxyXG5leHBvcnQgY2xhc3MgRGVidWdWaWV3UnVudGltZUNvbnRyb2wgZXh0ZW5kcyBDb21wb25lbnQge1xyXG4gICAgQHByb3BlcnR5KE5vZGUpXHJcbiAgICBjb21wb3NpdGVNb2RlVG9nZ2xlOiBOb2RlIHwgbnVsbCA9IG51bGw7XHJcbiAgICBAcHJvcGVydHkoTm9kZSlcclxuICAgIHNpbmdsZU1vZGVUb2dnbGU6IE5vZGUgfCBudWxsID0gbnVsbDtcclxuICAgIEBwcm9wZXJ0eShOb2RlKVxyXG4gICAgRW5hYmxlQWxsQ29tcG9zaXRlTW9kZUJ1dHRvbjogTm9kZSB8IG51bGwgPSBudWxsO1xyXG5cdF9zaW5nbGU6IG51bWJlciA9IDA7XHJcblxyXG4gICAgcHJpdmF0ZSBzdHJTaW5nbGU6IHN0cmluZ1tdID0gW1xyXG4gICAgICAgICdObyBTaW5nbGUgRGVidWcnLFxyXG4gICAgICAgICdWZXJ0ZXggQ29sb3InLFxyXG4gICAgICAgICdWZXJ0ZXggTm9ybWFsJyxcclxuICAgICAgICAnVmVydGV4IFRhbmdlbnQnLFxyXG4gICAgICAgICdXb3JsZCBQb3NpdGlvbicsXHJcbiAgICAgICAgJ1ZlcnRleCBNaXJyb3InLFxyXG4gICAgICAgICdGYWNlIFNpZGUnLFxyXG4gICAgICAgICdVVjAnLFxyXG4gICAgICAgICdVVjEnLFxyXG4gICAgICAgICdVViBMaWdodG1hcCcsXHJcbiAgICAgICAgJ1Byb2plY3QgRGVwdGgnLFxyXG4gICAgICAgICdMaW5lYXIgRGVwdGgnLFxyXG5cclxuICAgICAgICAnRnJhZ21lbnQgTm9ybWFsJyxcclxuICAgICAgICAnRnJhZ21lbnQgVGFuZ2VudCcsXHJcbiAgICAgICAgJ0ZyYWdtZW50IEJpbm9ybWFsJyxcclxuICAgICAgICAnQmFzZSBDb2xvcicsXHJcbiAgICAgICAgJ0RpZmZ1c2UgQ29sb3InLFxyXG4gICAgICAgICdTcGVjdWxhciBDb2xvcicsXHJcbiAgICAgICAgJ1RyYW5zcGFyZW5jeScsXHJcbiAgICAgICAgJ01ldGFsbGljJyxcclxuICAgICAgICAnUm91Z2huZXNzJyxcclxuICAgICAgICAnU3BlY3VsYXIgSW50ZW5zaXR5JyxcclxuICAgICAgICAnSU9SJyxcclxuXHJcbiAgICAgICAgJ0RpcmVjdCBEaWZmdXNlJyxcclxuICAgICAgICAnRGlyZWN0IFNwZWN1bGFyJyxcclxuICAgICAgICAnRGlyZWN0IEFsbCcsXHJcbiAgICAgICAgJ0VudiBEaWZmdXNlJyxcclxuICAgICAgICAnRW52IFNwZWN1bGFyJyxcclxuICAgICAgICAnRW52IEFsbCcsXHJcbiAgICAgICAgJ0VtaXNzaXZlJyxcclxuICAgICAgICAnTGlnaHQgTWFwJyxcclxuICAgICAgICAnU2hhZG93JyxcclxuICAgICAgICAnQU8nLFxyXG5cclxuICAgICAgICAnRnJlc25lbCcsXHJcbiAgICAgICAgJ0RpcmVjdCBUcmFuc21pdCBEaWZmdXNlJyxcclxuICAgICAgICAnRGlyZWN0IFRyYW5zbWl0IFNwZWN1bGFyJyxcclxuICAgICAgICAnRW52IFRyYW5zbWl0IERpZmZ1c2UnLFxyXG4gICAgICAgICdFbnYgVHJhbnNtaXQgU3BlY3VsYXInLFxyXG4gICAgICAgICdUcmFuc21pdCBBbGwnLFxyXG4gICAgICAgICdEaXJlY3QgSW50ZXJuYWwgU3BlY3VsYXInLFxyXG4gICAgICAgICdFbnYgSW50ZXJuYWwgU3BlY3VsYXInLFxyXG4gICAgICAgICdJbnRlcm5hbCBBbGwnLFxyXG5cclxuICAgICAgICAnRm9nJyxcclxuICAgIF07XHJcbiAgICBwcml2YXRlIHN0ckNvbXBvc2l0ZTogc3RyaW5nW10gPSBbXHJcbiAgICAgICAgJ0RpcmVjdCBEaWZmdXNlJyxcclxuICAgICAgICAnRGlyZWN0IFNwZWN1bGFyJyxcclxuICAgICAgICAnRW52IERpZmZ1c2UnLFxyXG4gICAgICAgICdFbnYgU3BlY3VsYXInLFxyXG4gICAgICAgICdFbWlzc2l2ZScsXHJcbiAgICAgICAgJ0xpZ2h0IE1hcCcsXHJcbiAgICAgICAgJ1NoYWRvdycsXHJcbiAgICAgICAgJ0FPJyxcclxuXHJcbiAgICAgICAgJ05vcm1hbCBNYXAnLFxyXG4gICAgICAgICdGb2cnLFxyXG5cclxuICAgICAgICAnVG9uZSBNYXBwaW5nJyxcclxuICAgICAgICAnR2FtbWEgQ29ycmVjdGlvbicsXHJcblxyXG4gICAgICAgICdGcmVzbmVsJyxcclxuICAgICAgICAnVHJhbnNtaXQgRGlmZnVzZScsXHJcbiAgICAgICAgJ1RyYW5zbWl0IFNwZWN1bGFyJyxcclxuICAgICAgICAnSW50ZXJuYWwgU3BlY3VsYXInLFxyXG4gICAgICAgICdUVCcsXHJcbiAgICBdO1xyXG4gICAgcHJpdmF0ZSBzdHJNaXNjOiBzdHJpbmdbXSA9IFtcclxuICAgICAgICAnQ1NNIExheWVyIENvbG9yYXRpb24nLFxyXG4gICAgICAgICdMaWdodGluZyBXaXRoIEFsYmVkbycsXHJcbiAgICBdO1xyXG5cclxuICAgIHByaXZhdGUgY29tcG9zaXRlTW9kZVRvZ2dsZUxpc3Q6IE5vZGVbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSBzaW5nbGVNb2RlVG9nZ2xlTGlzdDogTm9kZVtdID0gW107XHJcbiAgICBwcml2YXRlIG1pc2NNb2RlVG9nZ2xlTGlzdDogTm9kZVtdID0gW107XHJcbiAgICBwcml2YXRlIHRleHRDb21wb25lbnRMaXN0OiBSaWNoVGV4dFtdID0gW107XHJcbiAgICBwcml2YXRlIGxhYmVsQ29tcG9uZW50TGlzdDogTGFiZWxbXSA9IFtdO1xyXG4gICAgcHJpdmF0ZSB0ZXh0Q29udGVudExpc3Q6IHN0cmluZ1tdID0gW107XHJcbiAgICBwcml2YXRlIGhpZGVCdXR0b25MYWJlbDogTGFiZWw7XHJcbiAgICBzdGFydCgpIHtcclxuICAgICAgICAvLyBnZXQgY2FudmFzIHJlc29sdXRpb25cclxuICAgICAgICBjb25zdCBjYW52YXMgPSB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChDYW52YXMpO1xyXG4gICAgICAgIGlmICghY2FudmFzKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2RlYnVnLXZpZXctcnVudGltZS1jb250cm9sIHNob3VsZCBiZSBjaGlsZCBvZiBDYW52YXMnKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgdWlUcmFuc2Zvcm0gPSB0aGlzLm5vZGUucGFyZW50LmdldENvbXBvbmVudChVSVRyYW5zZm9ybSk7XHJcbiAgICAgICAgY29uc3QgaGFsZlNjcmVlbldpZHRoID0gdWlUcmFuc2Zvcm0ud2lkdGggKiAwLjU7XHJcbiAgICAgICAgY29uc3QgaGFsZlNjcmVlbkhlaWdodCA9IHVpVHJhbnNmb3JtLmhlaWdodCAqIDAuNTtcclxuXHJcbiAgICAgICAgbGV0IHggPSAtaGFsZlNjcmVlbldpZHRoICsgaGFsZlNjcmVlbldpZHRoICogMC4xLCB5ID0gaGFsZlNjcmVlbkhlaWdodCAtIGhhbGZTY3JlZW5IZWlnaHQgKiAwLjE7XHJcbiAgICAgICAgY29uc3Qgd2lkdGggPSAyMDAsIGhlaWdodCA9IDIwO1xyXG5cclxuICAgICAgICAvLyBuZXcgbm9kZXNcclxuICAgICAgICBjb25zdCBtaXNjTm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZSgnTWlzY01vZGUnKTtcclxuICAgICAgICBjb25zdCBidXR0b25Ob2RlID0gaW5zdGFudGlhdGUobWlzY05vZGUpO1xyXG4gICAgICAgIGJ1dHRvbk5vZGUucGFyZW50ID0gdGhpcy5ub2RlO1xyXG4gICAgICAgIGJ1dHRvbk5vZGUubmFtZSA9ICdCdXR0b25zJztcclxuICAgICAgICBjb25zdCB0aXRsZU5vZGUgPSBpbnN0YW50aWF0ZShtaXNjTm9kZSk7XHJcbiAgICAgICAgdGl0bGVOb2RlLnBhcmVudCA9IHRoaXMubm9kZTtcclxuICAgICAgICB0aXRsZU5vZGUubmFtZSA9ICdUaXRsZXMnO1xyXG5cclxuICAgICAgICAvLyB0aXRsZVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMjsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG5ld0xhYmVsID0gaW5zdGFudGlhdGUodGhpcy5FbmFibGVBbGxDb21wb3NpdGVNb2RlQnV0dG9uLmdldENoaWxkQnlOYW1lKCdMYWJlbCcpKTtcclxuICAgICAgICAgICAgbmV3TGFiZWwuc2V0UG9zaXRpb24oeCArIChpID4gMCA/IDUwICsgd2lkdGggKiAyIDogMTUwKSwgeSwgMC4wKTtcclxuICAgICAgICAgICAgbmV3TGFiZWwuc2V0U2NhbGUoMC43NSwgMC43NSwgMC43NSk7XHJcbiAgICAgICAgICAgIG5ld0xhYmVsLnBhcmVudCA9IHRpdGxlTm9kZTtcclxuICAgICAgICAgICAgY29uc3QgbGFiZWxDb21wb25lbnQgPSBuZXdMYWJlbC5nZXRDb21wb25lbnQoTGFiZWwpO1xyXG4gICAgICAgICAgICBsYWJlbENvbXBvbmVudC5zdHJpbmcgPSBpID8gJy0tLS0tLS0tLS1Db21wb3NpdGUgTW9kZS0tLS0tLS0tLS0nIDogJy0tLS0tLS0tLS1TaW5nbGUgTW9kZS0tLS0tLS0tLS0nO1xyXG4gICAgICAgICAgICBsYWJlbENvbXBvbmVudC5jb2xvciA9IENvbG9yLldISVRFO1xyXG4gICAgICAgICAgICBsYWJlbENvbXBvbmVudC5vdmVyZmxvdyA9IDA7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWxDb21wb25lbnRMaXN0W3RoaXMubGFiZWxDb21wb25lbnRMaXN0Lmxlbmd0aF0gPSBsYWJlbENvbXBvbmVudDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkgLT0gaGVpZ2h0O1xyXG4gICAgICAgIC8vIHNpbmdsZVxyXG4gICAgICAgIGxldCBjdXJyZW50Um93ID0gMDtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3RyU2luZ2xlLmxlbmd0aDsgaSsrLCBjdXJyZW50Um93KyspIHtcclxuICAgICAgICAgICAgaWYgKGkgPT09IHRoaXMuc3RyU2luZ2xlLmxlbmd0aCA+PiAxKSB7XHJcbiAgICAgICAgICAgICAgICB4ICs9IHdpZHRoO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFJvdyA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IGkgPyBpbnN0YW50aWF0ZSh0aGlzLnNpbmdsZU1vZGVUb2dnbGUpIDogdGhpcy5zaW5nbGVNb2RlVG9nZ2xlO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnNldFBvc2l0aW9uKHgsIHkgLSBoZWlnaHQgKiBjdXJyZW50Um93LCAwLjApO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnNldFNjYWxlKDAuNSwgMC41LCAwLjUpO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnBhcmVudCA9IHRoaXMuc2luZ2xlTW9kZVRvZ2dsZS5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0Q29tcG9uZW50ID0gbmV3Tm9kZS5nZXRDb21wb25lbnRJbkNoaWxkcmVuKFJpY2hUZXh0KTtcclxuICAgICAgICAgICAgdGV4dENvbXBvbmVudC5zdHJpbmcgPSB0aGlzLnN0clNpbmdsZVtpXTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0Q29tcG9uZW50TGlzdFt0aGlzLnRleHRDb21wb25lbnRMaXN0Lmxlbmd0aF0gPSB0ZXh0Q29tcG9uZW50O1xyXG4gICAgICAgICAgICB0aGlzLnRleHRDb250ZW50TGlzdFt0aGlzLnRleHRDb250ZW50TGlzdC5sZW5ndGhdID0gdGV4dENvbXBvbmVudC5zdHJpbmc7XHJcblxyXG4gICAgICAgICAgICBuZXdOb2RlLm9uKFRvZ2dsZS5FdmVudFR5cGUuVE9HR0xFLCB0aGlzLnRvZ2dsZVNpbmdsZU1vZGUsIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5zaW5nbGVNb2RlVG9nZ2xlTGlzdFtpXSA9IG5ld05vZGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4ICs9IHdpZHRoO1xyXG4gICAgICAgIC8vIGJ1dHRvbnNcclxuICAgICAgICB0aGlzLkVuYWJsZUFsbENvbXBvc2l0ZU1vZGVCdXR0b24uc2V0UG9zaXRpb24oeCArIDE1LCB5LCAwLjApO1xyXG4gICAgICAgIHRoaXMuRW5hYmxlQWxsQ29tcG9zaXRlTW9kZUJ1dHRvbi5zZXRTY2FsZSgwLjUsIDAuNSwgMC41KTtcclxuICAgICAgICB0aGlzLkVuYWJsZUFsbENvbXBvc2l0ZU1vZGVCdXR0b24ub24oQnV0dG9uLkV2ZW50VHlwZS5DTElDSywgdGhpcy5lbmFibGVBbGxDb21wb3NpdGVNb2RlLCB0aGlzKTtcclxuICAgICAgICB0aGlzLkVuYWJsZUFsbENvbXBvc2l0ZU1vZGVCdXR0b24ucGFyZW50ID0gYnV0dG9uTm9kZTtcclxuICAgICAgICBsZXQgbGFiZWxDb21wb25lbnQgPSB0aGlzLkVuYWJsZUFsbENvbXBvc2l0ZU1vZGVCdXR0b24uZ2V0Q29tcG9uZW50SW5DaGlsZHJlbihMYWJlbCk7XHJcbiAgICAgICAgdGhpcy5sYWJlbENvbXBvbmVudExpc3RbdGhpcy5sYWJlbENvbXBvbmVudExpc3QubGVuZ3RoXSA9IGxhYmVsQ29tcG9uZW50O1xyXG5cclxuICAgICAgICBjb25zdCBjaGFuZ2VDb2xvckJ1dHRvbiA9IGluc3RhbnRpYXRlKHRoaXMuRW5hYmxlQWxsQ29tcG9zaXRlTW9kZUJ1dHRvbik7XHJcbiAgICAgICAgY2hhbmdlQ29sb3JCdXR0b24uc2V0UG9zaXRpb24oeCArIDkwLCB5LCAwLjApO1xyXG4gICAgICAgIGNoYW5nZUNvbG9yQnV0dG9uLnNldFNjYWxlKDAuNSwgMC41LCAwLjUpO1xyXG4gICAgICAgIGNoYW5nZUNvbG9yQnV0dG9uLm9uKEJ1dHRvbi5FdmVudFR5cGUuQ0xJQ0ssIHRoaXMuY2hhbmdlVGV4dENvbG9yLCB0aGlzKTtcclxuICAgICAgICBjaGFuZ2VDb2xvckJ1dHRvbi5wYXJlbnQgPSBidXR0b25Ob2RlO1xyXG4gICAgICAgIGxhYmVsQ29tcG9uZW50ID0gY2hhbmdlQ29sb3JCdXR0b24uZ2V0Q29tcG9uZW50SW5DaGlsZHJlbihMYWJlbCk7XHJcbiAgICAgICAgbGFiZWxDb21wb25lbnQuc3RyaW5nID0gJ1RleHRDb2xvcic7XHJcbiAgICAgICAgdGhpcy5sYWJlbENvbXBvbmVudExpc3RbdGhpcy5sYWJlbENvbXBvbmVudExpc3QubGVuZ3RoXSA9IGxhYmVsQ29tcG9uZW50O1xyXG5cclxuICAgICAgICBjb25zdCBIaWRlQnV0dG9uID0gaW5zdGFudGlhdGUodGhpcy5FbmFibGVBbGxDb21wb3NpdGVNb2RlQnV0dG9uKTtcclxuICAgICAgICBIaWRlQnV0dG9uLnNldFBvc2l0aW9uKHggKyAyMDAsIHksIDAuMCk7XHJcbiAgICAgICAgSGlkZUJ1dHRvbi5zZXRTY2FsZSgwLjUsIDAuNSwgMC41KTtcclxuICAgICAgICBIaWRlQnV0dG9uLm9uKEJ1dHRvbi5FdmVudFR5cGUuQ0xJQ0ssIHRoaXMuaGlkZVVJLCB0aGlzKTtcclxuICAgICAgICBIaWRlQnV0dG9uLnBhcmVudCA9IHRoaXMubm9kZS5wYXJlbnQ7XHJcbiAgICAgICAgbGFiZWxDb21wb25lbnQgPSBIaWRlQnV0dG9uLmdldENvbXBvbmVudEluQ2hpbGRyZW4oTGFiZWwpO1xyXG4gICAgICAgIGxhYmVsQ29tcG9uZW50LnN0cmluZyA9ICdIaWRlIFVJJztcclxuICAgICAgICB0aGlzLmxhYmVsQ29tcG9uZW50TGlzdFt0aGlzLmxhYmVsQ29tcG9uZW50TGlzdC5sZW5ndGhdID0gbGFiZWxDb21wb25lbnQ7XHJcbiAgICAgICAgdGhpcy5oaWRlQnV0dG9uTGFiZWwgPSBsYWJlbENvbXBvbmVudDtcclxuXHJcbiAgICAgICAgLy8gbWlzY1xyXG4gICAgICAgIHkgLT0gNDA7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0ck1pc2MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IGluc3RhbnRpYXRlKHRoaXMuY29tcG9zaXRlTW9kZVRvZ2dsZSk7XHJcbiAgICAgICAgICAgIG5ld05vZGUuc2V0UG9zaXRpb24oeCwgeSAtIGhlaWdodCAqIGksIDAuMCk7XHJcbiAgICAgICAgICAgIG5ld05vZGUuc2V0U2NhbGUoMC41LCAwLjUsIDAuNSk7XHJcbiAgICAgICAgICAgIG5ld05vZGUucGFyZW50ID0gbWlzY05vZGU7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0Q29tcG9uZW50ID0gbmV3Tm9kZS5nZXRDb21wb25lbnRJbkNoaWxkcmVuKFJpY2hUZXh0KTtcclxuICAgICAgICAgICAgdGV4dENvbXBvbmVudC5zdHJpbmcgPSB0aGlzLnN0ck1pc2NbaV07XHJcbiAgICAgICAgICAgIHRoaXMudGV4dENvbXBvbmVudExpc3RbdGhpcy50ZXh0Q29tcG9uZW50TGlzdC5sZW5ndGhdID0gdGV4dENvbXBvbmVudDtcclxuICAgICAgICAgICAgdGhpcy50ZXh0Q29udGVudExpc3RbdGhpcy50ZXh0Q29udGVudExpc3QubGVuZ3RoXSA9IHRleHRDb21wb25lbnQuc3RyaW5nO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgdG9nZ2xlQ29tcG9uZW50ID0gbmV3Tm9kZS5nZXRDb21wb25lbnQoVG9nZ2xlKTtcclxuICAgICAgICAgICAgdG9nZ2xlQ29tcG9uZW50LmlzQ2hlY2tlZCA9IGkgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIG5ld05vZGUub24oVG9nZ2xlLkV2ZW50VHlwZS5UT0dHTEUsIGkgPyB0aGlzLnRvZ2dsZUxpZ2h0aW5nV2l0aEFsYmVkbyA6IHRoaXMudG9nZ2xlQ1NNQ29sb3JhdGlvbiwgdGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMubWlzY01vZGVUb2dnbGVMaXN0W2ldID0gbmV3Tm9kZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIGNvbXBvc2l0ZVxyXG4gICAgICAgIHkgLT0gMTUwO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5zdHJDb21wb3NpdGUubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgbmV3Tm9kZSA9IGkgPyBpbnN0YW50aWF0ZSh0aGlzLmNvbXBvc2l0ZU1vZGVUb2dnbGUpIDogdGhpcy5jb21wb3NpdGVNb2RlVG9nZ2xlO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnNldFBvc2l0aW9uKHgsIHkgLSBoZWlnaHQgKiBpLCAwLjApO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnNldFNjYWxlKDAuNSwgMC41LCAwLjUpO1xyXG4gICAgICAgICAgICBuZXdOb2RlLnBhcmVudCA9IHRoaXMuY29tcG9zaXRlTW9kZVRvZ2dsZS5wYXJlbnQ7XHJcblxyXG4gICAgICAgICAgICBjb25zdCB0ZXh0Q29tcG9uZW50ID0gbmV3Tm9kZS5nZXRDb21wb25lbnRJbkNoaWxkcmVuKFJpY2hUZXh0KTtcclxuICAgICAgICAgICAgdGV4dENvbXBvbmVudC5zdHJpbmcgPSB0aGlzLnN0ckNvbXBvc2l0ZVtpXTtcclxuICAgICAgICAgICAgdGhpcy50ZXh0Q29tcG9uZW50TGlzdFt0aGlzLnRleHRDb21wb25lbnRMaXN0Lmxlbmd0aF0gPSB0ZXh0Q29tcG9uZW50O1xyXG4gICAgICAgICAgICB0aGlzLnRleHRDb250ZW50TGlzdFt0aGlzLnRleHRDb250ZW50TGlzdC5sZW5ndGhdID0gdGV4dENvbXBvbmVudC5zdHJpbmc7XHJcblxyXG4gICAgICAgICAgICBuZXdOb2RlLm9uKFRvZ2dsZS5FdmVudFR5cGUuVE9HR0xFLCB0aGlzLnRvZ2dsZUNvbXBvc2l0ZU1vZGUsIHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgdGhpcy5jb21wb3NpdGVNb2RlVG9nZ2xlTGlzdFtpXSA9IG5ld05vZGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlzVGV4dE1hdGNoZWQodGV4dFVJLCB0ZXh0RGVzY3JpcHRpb24pIDogYm9vbGVhbiB7XHJcbiAgICAgICAgbGV0IHRlbXBUZXh0ID0gbmV3IFN0cmluZyh0ZXh0VUkpO1xyXG4gICAgICAgIGNvbnN0IGZpbmRJbmRleCA9IHRlbXBUZXh0LnNlYXJjaCgnPicpO1xyXG4gICAgICAgIGlmIChmaW5kSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZXh0VUkgPT09IHRleHREZXNjcmlwdGlvbjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0ZW1wVGV4dCA9IHRlbXBUZXh0LnN1YnN0cihmaW5kSW5kZXggKyAxKTtcclxuICAgICAgICAgICAgdGVtcFRleHQgPSB0ZW1wVGV4dC5zdWJzdHIoMCwgdGVtcFRleHQuc2VhcmNoKCc8JykpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGVtcFRleHQgPT09IHRleHREZXNjcmlwdGlvbjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0b2dnbGVTaW5nbGVNb2RlKHRvZ2dsZTogVG9nZ2xlKSB7XHJcbiAgICAgICAgY29uc3QgZGVidWdWaWV3ID0gZGlyZWN0b3Iucm9vdCEuZGVidWdWaWV3O1xyXG4gICAgICAgIGNvbnN0IHRleHRDb21wb25lbnQgPSB0b2dnbGUuZ2V0Q29tcG9uZW50SW5DaGlsZHJlbihSaWNoVGV4dCk7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnN0clNpbmdsZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1RleHRNYXRjaGVkKHRleHRDb21wb25lbnQuc3RyaW5nLCB0aGlzLnN0clNpbmdsZVtpXSkpIHtcclxuICAgICAgICAgICAgICAgIGRlYnVnVmlldy5zaW5nbGVNb2RlID0gaTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRvZ2dsZUNvbXBvc2l0ZU1vZGUodG9nZ2xlOiBUb2dnbGUpIHtcclxuICAgICAgICBjb25zdCBkZWJ1Z1ZpZXcgPSBkaXJlY3Rvci5yb290IS5kZWJ1Z1ZpZXc7XHJcbiAgICAgICAgY29uc3QgdGV4dENvbXBvbmVudCA9IHRvZ2dsZS5nZXRDb21wb25lbnRJbkNoaWxkcmVuKFJpY2hUZXh0KTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuc3RyQ29tcG9zaXRlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzVGV4dE1hdGNoZWQodGV4dENvbXBvbmVudC5zdHJpbmcsIHRoaXMuc3RyQ29tcG9zaXRlW2ldKSkge1xyXG4gICAgICAgICAgICAgICAgZGVidWdWaWV3LmVuYWJsZUNvbXBvc2l0ZU1vZGUoaSwgdG9nZ2xlLmlzQ2hlY2tlZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0b2dnbGVMaWdodGluZ1dpdGhBbGJlZG8odG9nZ2xlOiBUb2dnbGUpIHtcclxuICAgICAgICBjb25zdCBkZWJ1Z1ZpZXcgPSBkaXJlY3Rvci5yb290IS5kZWJ1Z1ZpZXc7XHJcbiAgICAgICAgZGVidWdWaWV3LmxpZ2h0aW5nV2l0aEFsYmVkbyA9IHRvZ2dsZS5pc0NoZWNrZWQ7XHJcbiAgICB9XHJcbiAgICB0b2dnbGVDU01Db2xvcmF0aW9uKHRvZ2dsZTogVG9nZ2xlKSB7XHJcbiAgICAgICAgY29uc3QgZGVidWdWaWV3ID0gZGlyZWN0b3Iucm9vdCEuZGVidWdWaWV3O1xyXG4gICAgICAgIGRlYnVnVmlldy5jc21MYXllckNvbG9yYXRpb24gPSB0b2dnbGUuaXNDaGVja2VkO1xyXG4gICAgfVxyXG4gICAgZW5hYmxlQWxsQ29tcG9zaXRlTW9kZShidXR0b246IEJ1dHRvbikge1xyXG4gICAgICAgIGNvbnN0IGRlYnVnVmlldyA9IGRpcmVjdG9yLnJvb3QhLmRlYnVnVmlldztcclxuICAgICAgICBkZWJ1Z1ZpZXcuZW5hYmxlQWxsQ29tcG9zaXRlTW9kZSh0cnVlKTtcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuY29tcG9zaXRlTW9kZVRvZ2dsZUxpc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY29uc3QgdG9nZ2xlQ29tcG9uZW50ID0gdGhpcy5jb21wb3NpdGVNb2RlVG9nZ2xlTGlzdFtpXS5nZXRDb21wb25lbnQoVG9nZ2xlKTtcclxuICAgICAgICAgICAgdG9nZ2xlQ29tcG9uZW50LmlzQ2hlY2tlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBsZXQgdG9nZ2xlQ29tcG9uZW50ID0gdGhpcy5taXNjTW9kZVRvZ2dsZUxpc3RbMF0uZ2V0Q29tcG9uZW50KFRvZ2dsZSk7XHJcbiAgICAgICAgdG9nZ2xlQ29tcG9uZW50LmlzQ2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIGRlYnVnVmlldy5jc21MYXllckNvbG9yYXRpb24gPSBmYWxzZTtcclxuICAgICAgICB0b2dnbGVDb21wb25lbnQgPSB0aGlzLm1pc2NNb2RlVG9nZ2xlTGlzdFsxXS5nZXRDb21wb25lbnQoVG9nZ2xlKTtcclxuICAgICAgICB0b2dnbGVDb21wb25lbnQuaXNDaGVja2VkID0gdHJ1ZTtcclxuICAgICAgICBkZWJ1Z1ZpZXcubGlnaHRpbmdXaXRoQWxiZWRvID0gdHJ1ZTtcclxuICAgIH1cclxuICAgIGhpZGVVSShidXR0b246IEJ1dHRvbikge1xyXG4gICAgICAgIGNvbnN0IHRpdGxlTm9kZSA9IHRoaXMubm9kZS5nZXRDaGlsZEJ5TmFtZSgnVGl0bGVzJyk7XHJcbiAgICAgICAgY29uc3QgYWN0aXZlVmFsdWUgPSAhdGl0bGVOb2RlLmFjdGl2ZTtcclxuICAgICAgICB0aGlzLnNpbmdsZU1vZGVUb2dnbGVMaXN0WzBdLnBhcmVudC5hY3RpdmUgPSBhY3RpdmVWYWx1ZTtcclxuICAgICAgICB0aGlzLm1pc2NNb2RlVG9nZ2xlTGlzdFswXS5wYXJlbnQuYWN0aXZlID0gYWN0aXZlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5jb21wb3NpdGVNb2RlVG9nZ2xlTGlzdFswXS5wYXJlbnQuYWN0aXZlID0gYWN0aXZlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5FbmFibGVBbGxDb21wb3NpdGVNb2RlQnV0dG9uLnBhcmVudC5hY3RpdmUgPSBhY3RpdmVWYWx1ZTtcclxuICAgICAgICB0aXRsZU5vZGUuYWN0aXZlID0gYWN0aXZlVmFsdWU7XHJcbiAgICAgICAgdGhpcy5oaWRlQnV0dG9uTGFiZWwuc3RyaW5nID0gYWN0aXZlVmFsdWUgPyAnSGlkZSBVSScgOiAnU2hvdyBVSSc7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBfY3VycmVudENvbG9ySW5kZXggPSAwO1xyXG4gICAgcHJpdmF0ZSBzdHJDb2xvcjogc3RyaW5nW10gPSBbXHJcbiAgICAgICAgJzxjb2xvcj0jZmZmZmZmPicsXHJcbiAgICAgICAgJzxjb2xvcj0jMDAwMDAwPicsXHJcbiAgICAgICAgJzxjb2xvcj0jZmYwMDAwPicsXHJcbiAgICAgICAgJzxjb2xvcj0jMDBmZjAwPicsXHJcbiAgICAgICAgJzxjb2xvcj0jMDAwMGZmPicsXHJcbiAgICBdO1xyXG4gICAgcHJpdmF0ZSBjb2xvcjogQ29sb3JbXSA9IFtcclxuICAgICAgICBDb2xvci5XSElURSxcclxuICAgICAgICBDb2xvci5CTEFDSyxcclxuICAgICAgICBDb2xvci5SRUQsXHJcbiAgICAgICAgQ29sb3IuR1JFRU4sXHJcbiAgICAgICAgQ29sb3IuQkxVRSxcclxuICAgIF07XHJcbiAgICBjaGFuZ2VUZXh0Q29sb3IoYnV0dG9uOiBCdXR0b24pIHtcclxuICAgICAgICB0aGlzLl9jdXJyZW50Q29sb3JJbmRleCsrO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJyZW50Q29sb3JJbmRleCA+PSB0aGlzLnN0ckNvbG9yLmxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJyZW50Q29sb3JJbmRleCA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy50ZXh0Q29tcG9uZW50TGlzdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnRleHRDb21wb25lbnRMaXN0W2ldLnN0cmluZyA9IHRoaXMuc3RyQ29sb3JbdGhpcy5fY3VycmVudENvbG9ySW5kZXhdICsgdGhpcy50ZXh0Q29udGVudExpc3RbaV0gKyAnPC9jb2xvcj4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMubGFiZWxDb21wb25lbnRMaXN0Lmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHRoaXMubGFiZWxDb21wb25lbnRMaXN0W2ldLmNvbG9yID0gdGhpcy5jb2xvclt0aGlzLl9jdXJyZW50Q29sb3JJbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIG9uTG9hZCgpIHtcclxuICAgIH1cclxuICAgIHVwZGF0ZShkZWx0YVRpbWU6IG51bWJlcikge1xyXG4gICAgfVxyXG59XHJcbiJdfQ==