import * as core from "@actions/core";
import * as github from "@actions/github";

async function main(): Promise<void> {
  // Authenticate with Pipedream, I guess
  const stabilityPeriod = core.getInput("stabilityPeriodMinutes", { required: true });
  const environments = core.getInput("environments", { required: true });

  // Take the HEAD commit message, if it exists.
  const commitMessage = github.context.payload.commits[0]?.message;

  // Parse the stability period, so we know it's a valid number before sending it to the API
  const stabilityPeriodMinutes = parseInt(stabilityPeriod, 10);
  if (isNaN(stabilityPeriodMinutes)) {
    core.setFailed(`Invalid stabilityPeriodMinutes ${stabilityPeriod}`);
    return
  }

  const token = await core.getIDToken();
  const res = await fetch("https://pipedream-ci.vercel.app/api/workflow", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: new URLSearchParams({
      git_ref: github.context.ref,
      environments,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      sha: github.context.sha,
      stability_period_minutes: stabilityPeriod,
      commit_message: commitMessage,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    core.setFailed(`Failed to trigger deployment: ${text}`);
    return
  }

  const out = await res.json();
  core.setOutput("url", out.url);
}

main()
  .then(() => core.info('Deployment triggered'))
  .catch((e: any) => core.setFailed(e.message));
