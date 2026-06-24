#! /usr/bin/env bash

set -euxo pipefail

export DEBIAN_FRONTEND=noninteractive

SCRIPT_DIRNAME=$(cd $(dirname ${0}) && pwd)
PROJECT_DIRNAME=$(cd ${SCRIPT_DIRNAME}/../.. && pwd)

cd ${PROJECT_DIRNAME}

rm -rf ${HOME}/.gitconfig
git config --local core.trustctime false
git config --local init.defaultBranch ${GIT_DEFAULT_BRANCH}
git config --local user.name ${GIT_USER_NAME}
git config --local user.email ${GIT_USER_EMAIL}
