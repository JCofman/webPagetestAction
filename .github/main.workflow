workflow "Run Webpagetest" {
  on = "push"
  resolves = ["WebPageTestActions"]
}

action "WebPageTestActions" {
  uses = "./"
  secrets = [
    "GITHUB_TOKEN",
    "WEBPAGETEST_API_KEY",
  ]
  args = "TEST_URL"
}
