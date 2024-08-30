module.exports = {
  git: {
    commit: true,
    tag: true,
    push: true
  },
  // github: {
  //   release: true,
  //   releaseName: 'v${version}'
  // },
  npm: {
    publish: true,
    publishPath: 'npm'
  },
  // hooks: {
  //   "after:github:release": "deno task b"
  // },
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	}
}