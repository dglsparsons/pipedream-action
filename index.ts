import * as core from "@actions/core";
import * as github from "@actions/github";

async function main(): Promise<void> {
  // Authenticate with Pipedream, I guess
  const secret = core.getInput("secret", { required: true });
  // Commits made with the default `GITHUB_TOKEN` won't trigger workflows.
  // So we need to use a personal access token.
  // See: https://docs.github.com/en/actions/security-guides/automatic-token-authentication#using-the-github_token-in-a-workflow
  const githubToken = core.getInput("github-token", { required: true });
  const workflow = core.getInput("workflow", { required: true });
  const stabilityPeriodRaw = core.getInput("stabilityPeriodMinutes", { required: true });
  const wavesRaw = core.getInput("waves", { required: true });

  const ref = github.context.ref;
  const sha = github.context.sha;
  const repo = github.context.repo

  const stabilityPeriodMinutes = parseInt(stabilityPeriodRaw, 10);
  if (isNaN(stabilityPeriodMinutes)) {
    core.setFailed(`Invalid stabilityPeriodMinutes ${stabilityPeriodRaw}`);
    return
  }

  const res = await fetch("TODO - some URL here", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      githubToken,
      ref,
      repo,
      sha,
      stabilityPeriodMinutes: parseInt(stabilityPeriodRaw, 10),
      waves: parseInt(wavesRaw, 10),
      workflow,
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
