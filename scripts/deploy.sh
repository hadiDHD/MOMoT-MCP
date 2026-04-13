#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${TARGET_BRANCH:-gh-pages}"
DEPLOY_REMOTE="${DEPLOY_REMOTE:-origin}"
SOURCE_REPO_DIR="${SOURCE_REPO_DIR:-$(pwd)}"
UPDATE_SITE_DIR="${UPDATE_SITE_DIR:-${SOURCE_REPO_DIR}/releng/at.ac.tuwien.big.momot.update/target/repository}"
SITE_REPO_SUBPATH="${SITE_REPO_SUBPATH:-eclipse/updates/latest/develop}"
EXPECTED_FORK_SLUG="hadiDHD/momot-2.0"

if [[ "${TRAVIS_PULL_REQUEST:-false}" != "false" ]]; then
    echo "Skipping deployment for pull request build."
    exit 0
fi

if [[ ! -d "${UPDATE_SITE_DIR}" ]]; then
    echo "Update site directory missing: ${UPDATE_SITE_DIR}" >&2
    exit 1
fi

if [[ ! -f "${UPDATE_SITE_DIR}/content.jar" && ! -f "${UPDATE_SITE_DIR}/content.xml" ]]; then
    echo "Missing p2 metadata: content.jar/content.xml not found in ${UPDATE_SITE_DIR}" >&2
    exit 1
fi

if [[ ! -f "${UPDATE_SITE_DIR}/artifacts.jar" && ! -f "${UPDATE_SITE_DIR}/artifacts.xml" ]]; then
    echo "Missing p2 metadata: artifacts.jar/artifacts.xml not found in ${UPDATE_SITE_DIR}" >&2
    exit 1
fi

REMOTE_URL="$(git -C "${SOURCE_REPO_DIR}" remote get-url "${DEPLOY_REMOTE}")"
if [[ "${REMOTE_URL}" != *"github.com/${EXPECTED_FORK_SLUG}"* && "${REMOTE_URL}" != *"github.com:${EXPECTED_FORK_SLUG}"* ]]; then
    echo "Refusing publish: ${DEPLOY_REMOTE} (${REMOTE_URL}) is not the expected fork ${EXPECTED_FORK_SLUG}." >&2
    exit 1
fi

SHA="$(git -C "${SOURCE_REPO_DIR}" rev-parse --verify HEAD)"
WORK_DIR="$(cd "${SOURCE_REPO_DIR}/.." && pwd)/gh-pages"

rm -rf "${WORK_DIR}"
if git ls-remote --exit-code --heads "${REMOTE_URL}" "${TARGET_BRANCH}" >/dev/null 2>&1; then
    git clone --depth=50 --branch "${TARGET_BRANCH}" "${REMOTE_URL}" "${WORK_DIR}"
else
    git clone --depth=50 "${REMOTE_URL}" "${WORK_DIR}"
    git -C "${WORK_DIR}" checkout --orphan "${TARGET_BRANCH}"
    git -C "${WORK_DIR}" rm -rf . >/dev/null 2>&1 || true
fi

mkdir -p "${WORK_DIR}/${SITE_REPO_SUBPATH}"
rm -rf "${WORK_DIR}/${SITE_REPO_SUBPATH}"/*
cp -a "${UPDATE_SITE_DIR}"/. "${WORK_DIR}/${SITE_REPO_SUBPATH}/"

git -C "${WORK_DIR}" config user.name "${GIT_AUTHOR_NAME:-MOMoT Build Bot}"
git -C "${WORK_DIR}" config user.email "${GIT_AUTHOR_EMAIL:-momot-bot@users.noreply.github.com}"

if [[ -z "$(git -C "${WORK_DIR}" status --porcelain -- "${SITE_REPO_SUBPATH}")" ]]; then
    echo "No update-site changes to publish; exiting."
    exit 0
fi

git -C "${WORK_DIR}" add "${SITE_REPO_SUBPATH}"
git -C "${WORK_DIR}" commit -m "Deploy update site from ${SHA}"
git -C "${WORK_DIR}" push "${REMOTE_URL}" "HEAD:${TARGET_BRANCH}"
