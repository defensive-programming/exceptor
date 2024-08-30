import * as dnt from "@deno/dnt";
import metadata from './../deno.json' with { type: "json" };


await dnt.emptyDir("./npm");

await dnt.build({
  entryPoints: ["./src/index.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  importMap: "./deno.json", // https://github.com/denoland/dnt/issues/260
  package: {
    name: metadata.name,
    version: metadata.version,
    description: metadata.description,
    license: metadata.license,
    // repository: {
    //   type: "git",
    //   url: "git+https://github.com/username/repo.git",
    // },
    // bugs: {
    //   url: "https://github.com/username/repo/issues",
    // },
  },
  postBuild() {
    // steps to run after building and before running the tests
    // Deno.copyFileSync("LICENSE", "npm/LICENSE");
    Deno.copyFileSync("README.md", "npm/README.md");

    // Create or modify the .npmignore file
    const npmignoreContent = `
      /src
      esm/test.js
      esm/test.d.ts
      script/test.js
      script/test.d.ts
      test_runner.js
      yarn.lock
      pnpm-lock.yaml
      !script/src
    `;
    Deno.writeTextFileSync("npm/.npmignore", npmignoreContent.trim());
  },
});