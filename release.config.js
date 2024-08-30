module.exports = {
  git: {
    commit: true,
    tag: true,
    push: true
  },
  github: {
    release: true,
  },
  npm: {
    publish: true,
    publishPath: './npm'
  },
  hook: {
    "after:github:release": "deno task b"
  },
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	}
}