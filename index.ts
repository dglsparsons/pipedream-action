import * as core from "@actions/core";

async function main(): Promise<void> {
  const secret = core.getInput("secret", { required: true });
  const githubToken = core.getInput("github-token", { required: true });
  const workflow = core.getInput("workflow", { required: true });
  const stabilityPeriodRaw = core.getInput("stabilityPeriodMinutes", { required: true });
  const wavesRaw = core.getInput("waves", { required: true });

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
      workflow,
      stabilityPeriodMinutes: parseInt(stabilityPeriodRaw, 10),
      waves: parseInt(wavesRaw, 10),
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
