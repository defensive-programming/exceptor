import * as dnt from "@deno/dnt";
import denoJSON from 'denoJSON' with { type: "json" };
import packageJSON from 'packageJSON' with { type: "json" };
import * as U from '@es-toolkit/es-toolkit';
import { exists } from "@std/fs";
import * as cst from "./../constant.ts";

const addMoreEntriesIntoNpmIgnore = () =>
{ // DNT does define some entries in .npmignore, but it's not enough
  const $p = `${cst.folder.dist}/${cst.file.npmignore}`;
  return exists($p)
    .then(() => Deno.readTextFileSync($p))
    .then((c: string) => Deno.writeTextFileSync($p, (c += "package-lock.json").trim()))
}

const removeNodeModulesFolderIfExists = () =>
(
  exists("node_modules")
  .then(() => Deno.remove("node_modules", { recursive: true }))
  .catch(() => console.error('Fail to remove node_modules'))
);

await dnt.emptyDir(cst.folder.dist);

await dnt.build({
  esModule: false,
  test: false, // @20240830
  entryPoints: ["./src/index.ts"],
  outDir: cst.folder.dist,
  shims: {
    deno: true, // so if you've used Deno-specific APIs, they will be transformed into Node.js APIs during the build
  },
  compilerOptions: {
    lib: ['DOM.Iterable', 'DOM']
  },
  importMap: "./deno.json", // https://github.com/denoland/dnt/issues/260
  package: {
    name: denoJSON.name,
    version: denoJSON.version,
    ...U.omit(packageJSON, ['scripts'])
  },
  declaration: 'inline',
  postBuild() {
    // steps to run after building and before running the tests
    Deno.copyFileSync(cst.file.license, `${cst.folder.dist}/${cst.file.license}`);
    Deno.copyFileSync(cst.file.readme, `${cst.folder.dist}/${cst.file.readme}`);
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
     * Note that, it seems like some npm packages can cause deno to generate node_modules,
     * (https://github.com/denoland/deno/issues/17930)
     * and there's an option that can force that to be generated, which has been used in deno.json: `nodeModulesDir`
     */
    return addMoreEntriesIntoNpmIgnore().then(() => removeNodeModulesFolderIfExists())
  },
});