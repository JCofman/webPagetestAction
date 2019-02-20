// index.js
const { Toolkit } = require("actions-toolkit");
const tools = new Toolkit();
const webPageTest = require("webpagetest");

const { event, payload, arguments, sha } = tools.context;

// check pre-requirements
if (!checkForMissingEnv) tools.exit.failure("Failed!");
// run the script
run();

async function run() {
  try {
    if (event === "push") {
      console.log(payload);
      console.log(arguments);
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
      // 4. print results to pull requests
      const {
        params: { owner, repo }
      } = tools.context.repo({ path: ".github/config.yml" });

      const result = await octokit.repos.createCommitComment({
        owner,
        repo,
        sha,
        body: finalResultsAsMarkdown
      });
      tools.exit.success("Succesfully run!");
    }
  } catch (error) {
    console.log(error);
  }
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
    "WEBPAGETEST_API_KEY"
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

async function runWebPagetest(wpt) {
  return new Promise((resolve, reject) => {
    wpt.runTest(
      process.env.TEST_URL || "https://jcofman.de",
      {
        location: process.env.location || "Dulles_MotoG4", // <location> string to test from https://www.webpagetest.org/getLocations.php?f=html
        connectivity: process.env.connectivity || "3GSlow", // <profile> string: connectivity profile -- requires location to be specified -- (Cable|DSL|3GSlow|3G|3GFast|4G|LTE|Edge|2G|Dial|FIOS|Native|custom) [Cable]
        runs: process.env.runs || 1, // <number>: number of test runs [1]
        first: process.env.first || false, // skip the Repeat View test
        video: process.env.video || true, // capture video
        pollResults: process.env.pollResults || 5, // <number>: poll results
        private: process.env.private || false, // keep the test hidden from the test log
        label: process.env.label || "", // <label>: string label for the test
        mobile: process.env.mobile || 1,
        device: process.env.device || "Motorola G (gen 4)",
        timeout: process.env.timeout || 1000,
        lighthouse: process.env.lighthouse || true
      },
      function(err, result) {
        if (err) {
          tools.log.error(
            `There was an issue while running the webpagetest run ${err}`
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
  const dataAsMarkdown = `
  # WebpageTest report
  * run id: ${result.data.id}
  * URL testid: ${result.data.testUrl}
  * Summary of the test: ${result.data.summary}
  * location where the test has run: ${result.data.location}
  * from run parameter: ${result.data.from}
  * connectivity: ${result.data.connectivity}
  * successFullRuns: ${result.data.successfulFVRuns}
  ## Report
  # FilmStrip
  ## FirstView median
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.time} milliseconds |`;
      } else {
        return ` ${item.time} milliseconds |`;
      }
    })
    .join("")}
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `|--------------|`;
      } else {
        return `--------------|`;
      }
    })
    .join("")}
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ![alt text](${item.image}) |`;
      } else {
        return ` ![alt text](${item.image}) |`;
      }
    })
    .join("")}
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.VisuallyComplete} |`;
      } else {
        return ` ${item.VisuallyComplete} |`;
      }
    })
    .join("")}
  
  ## ReapeatView median
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.time} milliseconds |`;
      } else {
        return ` ${item.time} milliseconds |`;
      }
    })
    .join("")}
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `|--------------|`;
      } else {
        return `--------------|`;
      }
    })
    .join("")}
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ![alt text](${item.image}) |`;
      } else {
        return ` ![alt text](${item.image}) |`;
      }
    })
    .join("")}
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.VisuallyComplete} |`;
      } else {
        return ` ${item.VisuallyComplete} |`;
      }
    })
    .join("")}
  # VisualMetrics
  ## Metrics Median Run
  | View | First Paint | First Contentful Paint | First Meaningful Paint | Time to First Byte | Time to interactive |  Render Started |  Visualy Completed | SpeedIndex | Load Time |
  |----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
  FirstView  | ${result.data.median.firstView.firstPaint} | ${
    result.data.median.firstView.firstContentfulPaint
  } | ${result.data.median.firstView.firstMeaningfulPaint} | ${
    result.data.median.firstView["lighthouse.Performance.interactive"]
  } | ${result.data.median.firstView.TTFB} | ${
    result.data.median.firstView.render
  } | ${result.data.median.firstView.visualComplete} | ${
    result.data.median.firstView.SpeedIndex
  } | ${result.data.median.firstView.loadTime} |
  RepeatView | ${result.data.median.repeatView.firstPaint} | ${
    result.data.median.repeatView.firstContentfulPaint
  } | ${result.data.median.repeatView.firstMeaningfulPaint} | ${
    result.data.median.repeatView["lighthouse.Performance.interactive"]
  } | ${result.data.median.repeatView.TTFB} | ${
    result.data.median.repeatView.render
  } | ${result.data.median.repeatView.visualComplete} | ${
    result.data.median.repeatView.SpeedIndex
  } | ${result.data.median.repeatView.loadTime} |
    ## Metrics Average Run
    | View | First Paint | First Contentful Paint | First Meaningful Paint | Time to First Byte | Time to interactive |  Render Started |  Visualy Completed | SpeedIndex | Load Time |
    |----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
    FirstView  | ${result.data.average.firstView.firstPaint} | ${
    result.data.average.firstView.firstContentfulPaint
  } | ${result.data.average.firstView.firstMeaningfulPaint} | ${
    result.data.average.firstView["lighthouse.Performance.interactive"]
  } | ${result.data.average.firstView.TTFB} | ${
    result.data.average.firstView.render
  } | ${result.data.average.firstView.visualComplete} | ${
    result.data.average.firstView.SpeedIndex
  } | ${result.data.average.firstView.loadTime} |
    RepeatView | ${result.data.average.repeatView.firstPaint} | ${
    result.data.average.repeatView.firstContentfulPaint
  } | ${result.data.average.repeatView.firstMeaningfulPaint} | ${
    result.data.average.repeatView["lighthouse.Performance.interactive"]
  } | ${result.data.average.repeatView.TTFB} | ${
    result.data.average.repeatView.render
  } | ${result.data.average.repeatView.visualComplete} | ${
    result.data.average.repeatView.SpeedIndex
  } | ${result.data.average.repeatView.loadTime} |
  # Waterfall
  ## FirstView median
  ![alt text](${result.data.median.firstView.images.waterfall})
  # Files
  ## FirstView median Files
  | File | FileSize |
  |----------|----------|
   ${result.data.median.firstView.requests
     .map(request => `${request.url}|${humanFileSize(request.bytesIn)} \r\n`)
     .join("")}
      `;
  return dataAsMarkdown;
}

function humanFileSize(size) {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}
