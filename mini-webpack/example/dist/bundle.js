(function (modules) {
  function require(id) {
    let module = { exports: {} };

    // TODO 如何通过 filename 找到对应的函数呢？
    // key filename  -> fn
    // 1. 需要通过 filename 找到对应的模块函数
    const [fn,mapping] = modules[id];

    function localRequire(filename){
      const id = mapping[filename]
      return require(id)
    }

    fn(localRequire, module, module.exports);

    return module.exports;
  }

  require(1)
})({
   
  1 : [function (require, module, exports) {
    "use strict";

var _foo = require("./foo.js");

var _doc = require("./doc.md");

var _doc2 = _interopRequireDefault(_doc);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log("main");
console.log(_doc2.default);
(0, _foo.foo)(); 
  }, 
    {"./foo.js":2,"./doc.md":3} 
  ],
   
  2 : [function (require, module, exports) {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.foo = foo;

function foo() {
  console.log("foo");
} 
  }, 
    {} 
  ],
   
  3 : [function (require, module, exports) {
    "use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = 'this is a doc'; 
  }, 
    {} 
  ],
   
});
