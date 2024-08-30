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
    publishPath: 'npm',
    "ignoreVersion": true
  },
  hooks: {
    // "after:github:release": "deno task b"
    "after:bump": "deno task b"
  },
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	}
}