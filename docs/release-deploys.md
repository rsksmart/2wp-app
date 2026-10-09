# How releases deploy the PowPeg App

The PowPeg App runs on four sites. A GitHub release decides which build goes to which site. This page explains the rule, what we tested to choose it, and what we found.

## The rule

| You publish | It deploys to |
|---|---|
| A **pre-release** (the "Set as a pre-release" box is checked) | staging-testnet (powpeg.staging-testnet.rootstock.io) and staging-mainnet (powpeg.staging.rootstock.io) |
| A **full release** (the box is not checked) | testnet (powpeg.testnet.rootstock.io) and mainnet (powpeg.rootstock.io) |
| A pre-release that you later edit into a full release | testnet and mainnet, once |

Each deploy builds the release's own tag, so the Releases page always tells you which build runs where.

Pushing to a branch (`qa`, `release-candidate`, `main` or any other) deploys nothing. Pushing a tag without a release deploys nothing.

### Before this change

- A push to `qa` deployed staging-testnet, and a push to `release-candidate` deployed staging-mainnet. Staging could change with no release behind it.
- A pushed tag ending in `-rc` deployed testnet, and a pushed tag starting with `v` deployed mainnet. Some tags, such as `v2.6.0-rc`, matched both and deployed both sites at once.

## How it works

The four workflows in `.github/workflows/` listen to GitHub's `release` event instead of `push`:

- **Staging** (`deploy_staging_TestNet_UI.yml`, `deploy_staging_MainNet_UI.yml`) runs on the `published` event and deploys only when the release is a pre-release.
- **Production** (`deploy_TestNet_UI.yml`, `deploy_MainNet_UI.yml`) runs on the `released` event and deploys only when the release is a full release.

Each site has its own concurrency group. If two releases arrive close together, the deploy that is running finishes before the next one starts, so an older build never overwrites a newer one halfway through.

## What we tested

GitHub can send several events for one release, and its documentation does not say which ones fire in every case. A wrong guess would deploy production twice, or not at all. Before we changed the real workflows, we tested the behaviour.

### How

On 2026-10-07 we made a private throwaway repository, ran the test and deleted the repository. It held three workflows:

1. A **probe** workflow that listened to every release event and logged each one that fired.
2. A **staging candidate** with the exact staging trigger and condition described above.
3. A **production candidate** with the exact production trigger and condition.

The two candidates checked out the release tag and printed it. They deployed nothing.

We then created releases with the GitHub CLI (`gh release create` and `gh release edit`) for each case below and read the results from the Actions tab.

### Results

| Case | Events GitHub sent | Staging | Production |
|---|---|---|---|
| Pre-release published | created, published, prereleased | Deployed once | Did not run |
| Pre-release published from a draft | published | Deployed once | Did not run |
| Full release published | created, published, released | Started and skipped | Deployed once |
| Full release published from a draft | published, released | Started and skipped | Deployed once |
| Pre-release edited into a full release | released | Did not run | Deployed once |
| Full release changed back into a pre-release | prereleased | Did not run | Did not run |
| Release notes edited | edited | Did not run | Did not run |
| Branch pushed | none | Did not run | Did not run |
| Tag pushed with no release | none | Did not run | Did not run |

Every case deployed to the right sites, once. The checkout used the release's tag and commit each time.

### What this told us

- **Promoting a pre-release sends only `released`.** If production listened to `published`, as some other Rootstock repositories do, a promotion would never reach production. That is why production uses `released`.
- **Publishing a full release from a draft also sends `released`.** You can draft a release first and publish it later. It still deploys production once.
- **Staging cannot listen to `prereleased`.** That event does not fire for a pre-release published from a draft, and it does fire when a full release is changed back into a pre-release. Either would send the wrong build to staging.
- **A full release leaves a skipped run in each staging workflow.** GitHub sends `published` for full releases too, so the staging workflows start, check the release type and stop before deploying. A grey "skipped" run on the staging workflows after a full release is expected.

### What we did not test

We made all the releases through the GitHub CLI, not the GitHub website. Both use the same release API, so we expect the same events, but we did not prove it. To check, repeat the promotion and the draft case once by hand on any scratch repository.

## Things to know when you release

- **The pre-release box picks the site.** Check it for staging. Leave it unchecked for production. The tag name does not matter.
- **Anyone who can publish a full release can deploy production.** Before this change, only the people allowed to create `v*` tags could. If that is too wide, add required reviewers to the `testnet` and `mainnet` environments in the repository settings.
- **Releases created by a workflow with the default `GITHUB_TOKEN` deploy nothing.** GitHub does not start workflows from events that this token causes. Release automation must publish with a GitHub App token or a personal access token.
- **Old commits keep the old triggers.** GitHub reads the workflow file from the commit the release points at. A release on a commit from before this change does not deploy through the release event. A `-rc` or `v` tag pushed on such a commit still deploys through the old tag triggers.
- **Deploys only move forward.** Deleting a release, or changing a full release back into a pre-release, does not roll a site back. To roll back, publish a new release of the build you want.
- **testnet and mainnet deploy at the same time.** Before, the `-rc` tag reached testnet before the `v` tag reached mainnet. Now staging-mainnet is the last check before production.
