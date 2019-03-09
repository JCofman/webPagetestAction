# WebPageTest GitHub Action

⚡️🚀 GitHub Action to print [webPageTest.org](https://www.webpagetest.org/) results as a commit comment after a push.

<p></p>
<details>
  <summary> Click to see example commit comment </summary>
<p align="center">
  <img alt="example image" src="https://github.com/JCofman/webPagetestAction/blob/master/example.png"/>
</p>
</details>
<p></p>

Make sure to pass a WEBPAGETEST_API_KEY which you can get [here](https://www.webpagetest.org/getkey.php) and a TEST_URL.

## Secrets

- GITHUB_TOKEN - Required GitHub token provided by actions to validate requests and make sure you are allowed to comment on the repo
- WEBPAGETEST_API_KEY - Required API key which you either can provide by your own hosted WebPageTest instance or can get here [here](https://www.webpagetest.org/getkey.php)

## Environment Variables

- WEBPAGETEST_SERVER_URL - Optional By default this repo uses the awesome free WebPageTest `www.webpagetest.org` server offered by Akami but you can provide your own hosted version.
- TEST_URL - URL to run the audit e.g. `https://jcofman.de`

## Args

You should be able to provide custom args as mentioned in the https://github.com/marcelduran/webpagetest-api under the `Test (works for test command only)` section.

## Examples

Trigger a build to a specific site in Netlify

```hcl

workflow "Run Webpagetest" {
  on = "push"
  resolves = ["WebPageTestActions"]
}

action "WebPageTestActions" {
  secrets = [
    "GITHUB_TOKEN",
    "WEBPAGETEST_API_KEY",
  ]
  env = {
    TEST_URL = ""
  }
}

```

With self hosted WebPagetest server

```hcl

workflow "Run Webpagetest" {
  on = "push"
  resolves = ["WebPageTestActions"]
}

action "WebPageTestActions" {
  secrets = [
    "GITHUB_TOKEN",
    "WEBPAGETEST_API_KEY",
  ]
  env = {
    TEST_URL = ""
    WEBPAGETEST_SERVER_URL= "www.your-custom-server.org"
  }
}

```
