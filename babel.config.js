const babel = {
  presets: ["next/babel"],
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  babel.plugins = ["tempo-devtools/dist/babel-plugin"];
}

module.exports = babel;
