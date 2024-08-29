module.exports = {
  git: {
    commit: false,
    tag: false,
    push: false
  },
  github: {
    release: false,
  },
  npm: {
    publish: false,

  },
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	}
}