// ex. scripts/build_npm.ts
import { build, emptyDir } from "https://deno.land/x/dnt/mod.ts";

await emptyDir("./npm");

await build({
  entryPoints: ["./src/index.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  package: {
    name: "bug-fucker",
    version: Deno.args[0],
    description: "Your package.",
    license: "MIT",
    // repository: {
    //   type: "git",
    //   url: "git+https://github.com/username/repo.git",
    // },
    // bugs: {
    //   url: "https://github.com/username/repo/issues",
    // },
  },
  // postBuild() {
  //   // steps to run after building and before running the tests
  //   Deno.copyFileSync("LICENSE", "npm/LICENSE");
  //   Deno.copyFileSync("README.md", "npm/README.md");
  // },
});