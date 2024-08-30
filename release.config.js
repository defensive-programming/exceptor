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
	plugins: {
	  "@release-it/bumper": {
	    "in": "deno.json",
	    "out": "deno.json",
	  }
	},
  /**
   * WARN: Do not use any kind of npm feature here, cuz it doesn't work well with Deno.
   */
  npm: false
}