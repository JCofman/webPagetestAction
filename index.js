// index.js
const { Toolkit } = require("actions-toolkit");
const tools = new Toolkit();
const webPageTest = require("webpagetest");
const argv = require("yargs").argv;

const { event, payload, sha } = tools.context;

// check pre-requirements
if (!checkForMissingEnv) tools.exit.failure("Failed!");

// run the script
runAudit();

async function runAudit() {
  try {
    if (event === "push") {
      tools.log("Welcome to this example!");

      // 1. An authenticated instance of `@octokit/rest`, a GitHub API SDK
      const octokit = tools.github;

      // initialize webPagetest
      const wpt = new webPageTest(
        "www.webpagetest.org",
        process.env.WEBPAGETEST_API_KEY
      );

      // 2. run tests and save results
      const webpagetestResults = await runWebPagetest(wpt);

      // 3. convert results to markdown
      const finalResultsAsMarkdown = convertToMarkdown(webpagetestResults);

      // 4. print results to as commit comment
      const { owner, repo } = tools.context.repo({ ref: `${payload.ref}` });

      await octokit.repos.createCommitComment({
        owner,
        repo,
        sha,
        body: finalResultsAsMarkdown
      });

      tools.exit.success("Succesfully run!");
    }
  } catch (error) {
    tools.log.error(`Something went wrong ${error}!`);
  }
}

async function runWebPagetest(wpt) {
  return new Promise((resolve, reject) => {
    wpt.runTest(
      process.env.TEST_URL,
      {
        location: argv.location || "Dulles_MotoG4", // <location> string to test from https://www.webpagetest.org/getLocations.php?f=html
        connectivity: argv.connectivity || "3GSlow", // <profile> string: connectivity profile -- requires location to be specified -- (Cable|DSL|3GSlow|3G|3GFast|4G|LTE|Edge|2G|Dial|FIOS|Native|custom) [Cable]
        runs: argv.runs || 1, // <number>: number of test runs [1]
        first: argv.first || false, // skip the Repeat View test
        video: argv.video || true, // capture video
        pollResults: argv.pollResults || 5, // <number>: poll results
        private: argv.private || true, // keep the test hidden from the test log
        label: argv.label || "Github Action", // <label>: string label for the test
        mobile: argv.mobile || 1,
        device: argv.device || "Motorola G (gen 4)",
        timeout: argv.timeout || 10000,
        lighthouse: argv.lighthouse || true,
        ...argv
      },
      function(err, result) {
        if (err) {
          tools.log.error(
            `There was an issue while running the webpagetest run ${JSON.stringify(
              err
            )}`
          );
          reject(err);
        }
        if (result) {
          resolve(result);
        }
      }
    );
  });
}

function convertToMarkdown(result) {
  console.log(result.data.testUrl);
  const { data } = result;
  console.log(data.testUrl);
  const dataAsMarkdown = `
  # WebpageTest report
  * run id: ${data.id}
  * URL testid: ${data.testUrl}
  * Summary of the test: ${data.summary}
  * location where the test has run: ${data.location}
  * from run parameter: ${data.from}
  * connectivity: ${data.connectivity}
  * successFullRuns: ${data.successfulFVRuns}

  # Median Run Results
  ## Filmstrip First View
  ${data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.time} milliseconds |`;
      } else {
        return ` ${item.time} milliseconds |`;
      }
    })
    .join("")}
  ${data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `|--------------|`;
      } else {
        return `--------------|`;
      }
    })
    .join("")}
  ${data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ![alt text](${item.image}) |`;
      } else {
        return ` ![alt text](${item.image}) |`;
      }
    })
    .join("")}
  ${data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.VisuallyComplete} |`;
      } else {
        return ` ${item.VisuallyComplete} |`;
      }
    })
    .join("")}
  
  ## Filmstrip Repeat View 
  ${data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.time} milliseconds |`;
      } else {
        return ` ${item.time} milliseconds |`;
      }
    })
    .join("")}
  ${data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `|--------------|`;
      } else {
        return `--------------|`;
      }
    })
    .join("")}
  ${data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ![alt text](${item.image}) |`;
      } else {
        return ` ![alt text](${item.image}) |`;
      }
    })
    .join("")}
  ${data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.VisuallyComplete} |`;
      } else {
        return ` ${item.VisuallyComplete} |`;
      }
    })
    .join("")}
    ## Median Metrics
    | View | First Paint | First Contentful Paint | First Meaningful Paint | Time to First Byte | Time to interactive |  Render Started |  Visualy Completed | SpeedIndex | Load Time |
    |----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
    FirstView  | ${data.median.firstView.firstPaint} | ${
    data.median.firstView.firstContentfulPaint
  } | ${data.median.firstView.firstMeaningfulPaint} | ${
    data.median.firstView["lighthouse.Performance.interactive"]
  } | ${data.median.firstView.TTFB} | ${data.median.firstView.render} | ${
    data.median.firstView.visualComplete
  } | ${data.median.firstView.SpeedIndex} | ${data.median.firstView.loadTime} |
    RepeatView | ${data.median.repeatView.firstPaint} | ${
    data.median.repeatView.firstContentfulPaint
  } | ${data.median.repeatView.firstMeaningfulPaint} | ${
    data.median.repeatView["lighthouse.Performance.interactive"]
  } | ${data.median.repeatView.TTFB} | ${data.median.repeatView.render} | ${
    data.median.repeatView.visualComplete
  } | ${data.median.repeatView.SpeedIndex} | ${
    data.median.repeatView.loadTime
  } |  
  
  ## Median Waterfall
  ### FirstView
  ![alt text](${data.median.firstView.images.waterfall})
  ### RepeatView
  ![alt text](${data.median.repeatView.images.waterfall})

  ## Median Requests 
  ### FirstView
  | File | FileSize |
  |----------|----------|
   ${data.median.firstView.requests
     .map(request => `${request.url}|${humanFileSize(request.bytesIn)} \r\n`)
     .join("")}
  ### RepeatView
  | File | FileSize |
  |----------|----------|
   ${data.median.repeatView.requests
     .map(request => `${request.url}|${humanFileSize(request.bytesIn)} \r\n`)
     .join("")}
      `;
  return dataAsMarkdown;
}

/**
 * prints file size in a human readable format
 * @param {number} size
 */
function humanFileSize(size) {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

/**
 * Log warnings to the console for missing environment variables
 */
function checkForMissingEnv() {
  const requiredEnvVars = [
    "HOME",
    "GITHUB_WORKFLOW",
    "GITHUB_ACTION",
    "GITHUB_ACTOR",
    "GITHUB_REPOSITORY",
    "GITHUB_EVENT_NAME",
    "GITHUB_EVENT_PATH",
    "GITHUB_WORKSPACE",
    "GITHUB_SHA",
    "GITHUB_REF",
    "GITHUB_TOKEN",
    "WEBPAGETEST_API_KEY",
    "TEST_URL"
  ];

  const requiredButMissing = requiredEnvVars.filter(
    key => !process.env.hasOwnProperty(key)
  );
  if (requiredButMissing.length > 0) {
    // This isn't being run inside of a GitHub Action environment!
    const list = requiredButMissing.map(key => `- ${key}`).join("\n");
    const warning = `There are environment variables missing from this runtime.\n${list}`;
    tools.log.warn(warning);
    return false;
  } else {
    return true;
  }
}
