module.exports = {
  git: {
    commit: true,
    tag: true,
    push: true
  },
  github: {
    release: true,
    releaseName: 'v${version}'
  },
  hook: {
    "after:git:release": "deno task b"
  },
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	}
}