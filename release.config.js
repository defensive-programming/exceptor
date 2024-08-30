module.exports = {
  git: {
    commit: true,
    tag: true,
    push: true
  },
  npm: false,
  github: {
    release: true,
    releaseName: 'v${version}'
  },
  // hooks: {
  //   "after:bump": "deno task b"
  // },
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	}
}