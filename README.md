


# TODO
- release
  - bump the version on deno.json
  - git commit
  - git push
  - create release on Github
  - build npm
  - publish npm


# Workflow
### Develop
  ```bash
  > deno task d # check deno.json for more details
  ```
### Build
  ```bash
  > deno run -A ./script/build-npm.ts [version-statement]
  # eg., deno run -A ./script/build-npm.ts v0.0.1
  ```

### Check

  You don't need to do this unless you want to check which files will be packed for publishing.
  Usually this is for debugging purpose.
  ```bash
  > npm pack
  ```

### Publish
  ```bash
  > cd npm
  > npm publish # you may check which files will be packed by running `npm pack`
  ```

