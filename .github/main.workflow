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
  args = ["--location=Dulles_GalaxyS7"]
  env = {
    TEST_URL = "https://jcofman.de"
  }
}
