// index.js
const { Toolkit } = require("actions-toolkit");
const tools = new Toolkit();
const webPageTest = require("webpagetest");

const { event, payload, arguments, sha } = tools.context;
run();

async function run() {
  try {
    if (event === "push") {
      console.log(payload);
      console.log(arguments);
      tools.log("Welcome to this example!");
      // 1. An authenticated instance of `@octokit/rest`, a GitHub API SDK
      const octokit = tools.github;

      // 2. run tests and save results

      const webpagetestResults = await runWebPagetest();
      tools.log.success(webpagetestResults);

      // 3. convert results to markdown
      const finalResultsAsMarkdown = convertToMarkdown(webpagetestResults);
      console.log(finalResultsAsMarkdown);
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
    }
  } catch (error) {
    console.log(error);
  }
}

// /**
//  * get latest commit
//  * and push webpagetest results as comment to latest commit
//  */
// octokit.repos
//   .getCommit({ owner: myOwner, repo: myRepo, sha: gitBranch })
//   .then(commit => {
//     return github.repos.createCommitComment({
//       owner: myOwner,
//       repo: myRepo,
//       sha: commit.data.sha,
//       body: dataAsMarkdown
//     });
//   })
//   .catch(error => {
//     console.log(`ERROR could either not get commits of the repo ${myRepo} of the owner ${myOwner}
//             or could not sent the commit to the repositorie ERRORMSG: ${error}
//             `);
//   });
// Delete the branch
//   octokit.git
//     .deleteRef(
//       tools.context.repo({
//         ref: `heads/${payload.pull_request.head.ref}`
//       })
//     )
//     .then(() => {
//       console.log(`Branch ${payload.pull_request.head.ref} deleted!`);
//     });

async function runWebPagetest() {
  // initialize
  const wpt = new webPageTest("www.webpagetest.org", webpagetestApiKey);
  const results = await wpt.runTest(
    testURL || "https://jcofman.de",
    {
      location: location || "Dulles_MotoG4", // <location> string to test from https://www.webpagetest.org/getLocations.php?f=html
      connectivity: connectivity || "3GSlow", // <profile> string: connectivity profile -- requires location to be specified -- (Cable|DSL|3GSlow|3G|3GFast|4G|LTE|Edge|2G|Dial|FIOS|Native|custom) [Cable]
      runs: runs || 1, // <number>: number of test runs [1]
      first: first || false, // skip the Repeat View test
      video: video || true, // capture video
      pollResults: pollResults || 5, // <number>: poll results
      private: private || false, // keep the test hidden from the test log
      label: label || "", // <label>: string label for the test
      mobile: mobile || 1,
      device: device || "Motorola G (gen 4)",
      timeout: timeout || 1000,
      lighthouse: lighthouse || true
    },
    function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        return result;
      }
    }
  );
  return results;
}

function convertToMarkdown(result) {
  let dataAsMarkdown = `
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
