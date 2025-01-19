const fs = require("fs");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { transformFromAst } = require("babel-core");
const path = require("path");
const ejs = require("ejs");
let id = 1;
// const traverse = require("babel-traverse").default;
//
// 1. 获取到文件的内容和依赖关系

let globalConfig = {};

function createAsset(filename) {
  // 1. 获取文件的内容
  let source = fs.readFileSync(filename, "utf-8");
  // console.log(source);
  const loaders = globalConfig.module.rules;

  // test -> .md
  loaders.forEach((loaderConfig) => {
    const { test, use } = loaderConfig;
    if (test.test(filename)) {
      source = use(source);
    }
  });

  //   console.log(source);
  // 2. 如何获取到文件的依赖关系呢？
  // 借助 ast 来去解析 获取到依赖
  const ast = parser.parse(source, {
    sourceType: "module",
  });

  const deps = [];
  traverse(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });

  // es6+ -> es5
  const { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });

  // babel

  return {
    id: id++,
    filename,
    code,
    deps,
    mapping: {},
  };
}

function createGraph() {
  const filename = globalConfig.entry;
  const mainAsset = createAsset(filename);
  const dirname = path.dirname(filename);

  const queue = [mainAsset];

  // happy path
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      const child = createAsset(path.resolve(dirname, relativePath));
      asset.mapping[relativePath] = child.id;
      queue.push(child);
    });
  }

  // console.log(queue.length);

  return queue;
}

function bundle(graph) {
  // const context = "123";

  // 先去构建 modules
  function createModules() {
    const modules = {};
    graph.forEach((asset) => {
      modules[asset.id] = [asset.code, asset.mapping];
    });

    return modules;
  }

  function emitFile(context) {
    fs.writeFileSync("./example/dist/bundle.js", context);
  }

  const modules = createModules();
  // console.log(modules);
  const bundleTemplate = fs.readFileSync("./bundle.ejs", "utf-8");
  const code = ejs.render(bundleTemplate, {
    modules,
  });

  emitFile(code);
}

const mdLoader = function (source) {
  // 要写的就是 把  非 js 的代码 转换成 js 的代码
  console.log("mdloader---------------");
  console.log(source);
  // md -> html
  return `export default 'this is a doc'`;
};

const webpackConfig = {
  entry: "./example/main.js",
  module: {
    rules: [{ test: /\.md$/, use: mdLoader }],
  },
};

function webpack(config) {
  globalConfig = config;
  const graph = createGraph();

  bundle(graph);
}

webpack(webpackConfig);
