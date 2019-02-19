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
  args = ["container:release", "--app", "web"]
  env = {
    TEST_URL = "https://jcofman.de"
  }
}
