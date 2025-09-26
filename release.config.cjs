/** 
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ["main", "next", "semantic-release"],
  plugins: [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@anolilab/semantic-release-pnpm", {
      "npmPublish": false,
    }],
    "@semantic-release/github",
    // ["@intuit/semantic-release-slack", {
    //   "platforms": ["npm"],
    //   "fullReleaseNotes": true
    // }]
  ],
};
