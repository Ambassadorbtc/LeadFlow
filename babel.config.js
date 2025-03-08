module.exports = {
  presets: ["next/babel"],
};

if (process.env.NEXT_PUBLIC_TEMPO) {
  module.exports.plugins = ["tempo-devtools/dist/babel-plugin"];
}
