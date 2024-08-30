import * as dnt from "@deno/dnt";
import denoJSON from './../deno.json' with { type: "json" };
import packageJSON from './../package.json' with { type: "json" };

const metadata = {
  name: denoJSON.name,
  description: packageJSON.description,
  version: denoJSON.version,
  license: packageJSON.license,
  repository: packageJSON.repository,
}

await dnt.emptyDir("./npm");

await dnt.build({
  test: false, // @20240830
  entryPoints: ["./src/index.ts"],
  outDir: "./npm",
  shims: {
    deno: true,
  },
  importMap: "./deno.json", // https://github.com/denoland/dnt/issues/260
  package: metadata,
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
    /**
     * @20240830 HACK:
     * Currently, it seems that there's a bug as described below:
     * - `deno task launch`
     * - during the execution of `deno task build`, there's a node_modules will be created in the root folder
     * - that node_modules will finally cause the failed build
     * - but if you remove that node_modules and run  `deno task build` solely, it will be successful.
     *
     * It seems like the root cause is not really just the generated node_modules
     * (which shouldn't be generated), but the setting `test` in dnt configuration.
     *
     * Turn it off can make build successful.
     *
     */
    Deno.removeSync("node_modules", { recursive: true });
  },
});