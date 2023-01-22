#!/bin/bash

# exit on non-zero exit code and pipefail
set -o errexit -o pipefail

# Require running as root
if [[ $EUID -ne 0 ]]; then
    echo "Script must be run as root"
    exit 2
fi

# check for getopt compatibility
# if exit code isn't 4, enhanced getopt is not available
! getopt --test > /dev/null 
if [[ ${PIPESTATUS[0]} -ne 4 ]]; then
    echo 'Enhanced getopt not available'
    exit 1
fi

print_help() 
{
    echo "Usage: update.sh [OPTIONS]"
    echo
    echo "Options:"
    echo "-h                    print this help and exit"
    echo "-u [USER]             run commands as user"
    echo "-b [BRANCH]           branch to pull"
    echo "-l                    use openssl-legacy-provider node option for openssl3 systems"
    echo "--discard-changes     discard any local changes instead of stashing them"
    echo "--skip-migration      skip db migration"
    echo "--skip-precompile     skip precompiling assets"
}

BRANCH=v4.1.x

OPTIONS=hu:b:l
LONGOPTS=help,user:,branch:,legacy,discard-changes,skip-migration,skip-precompile

! PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
# Check if arguments have been parsed successfully
if [[ ${PIPESTATUS[0]} -ne 0 ]]; then
    print_help
    exit 2
fi

# Read output of getopt
eval set -- "$PARSED"

# Read arguments
while true;do
    case "$1" in
        -h|--help)
            print_help
            exit;;
        -u|--user)
            MASTODONUSER="$2"
            shift 2;;
        -b|--branch)
            BRANCH="$2"
            shift 2;;
        -l|--legacy)
            LEGACY=true
            shift;;
        --discard-changes)
            DISCARD=true
            shift;;
        --skip-migration)
            SKIP_MIGRATION=true
            shift;;
        --skip-precompile)
            SKIP_PRECOMPILE=true
            shift;;
        --)
            shift
            break;;
        *)
            echo "Parsing error"
            exit 3;;
    esac
done

# Check if parsed user exists
if ! id "$MASTODONUSER" &>/dev/null; then
    echo "User $MASTODONUSER not found"
    exit 2
fi

# Check if remote exists and if not add it
if ! sudo -u "$MASTODONUSER" git config remote.polyam.url > /dev/null;then
    echo "Adding polyam remote..."
    sudo -u "$MASTODONUSER" git remote add polyam https://github.com/polyamspace/mastodon.git
fi

# Fetch and pull new code from remote
echo "Fetching new code..."
sudo -u "$MASTODONUSER" git fetch polyam

if [[ ! "$DISCARD" ]];then
    # Stash local changes. Safer than restore.
    sudo -u "$MASTODONUSER" git stash
else
    # discards any local changes
    sudo -u "$MASTODONUSER" git restore .
fi

# Switch to branch if it differs from current branch
if [[ "$(sudo -u "$MASTODONUSER" git branch --show-current)" != "$BRANCH" ]]; then
    echo "Checking out polyam/$BRANCH..."
    sudo -u "$MASTODONUSER" git checkout polyam/"$BRANCH"
fi

sudo -u "$MASTODONUSER" git pull polyam

# Install dependencies
echo "Installing dependencies..."
sudo -u "$MASTODONUSER" bundle install && sudo -u "$MASTODONUSER" yarn install

# pre-deploy migration
if [[ ! "$SKIP_MIGRATION" ]];then
    echo "Running pre-deploy database migration..."
    sudo -u "$MASTODONUSER" RAILS_ENV=production SKIP_POST_DEPLOYMENT_MIGRATIONS=true bundle exec rails db:migrate
fi

# precompile assets
if [[ ! "$SKIP_PRECOMPILE" ]];then
    echo "Precompiling assets... This might take a while"
    if [[ "$LEGACY" ]]; then
        sudo -u "$MASTODONUSER" NODE_OPTIONS=--openssl-legacy-provider RAILS_ENV=production bundle exec rails assets:precompile
    else
        sudo -u "$MASTODONUSER" RAILS_ENV=production bundle exec rails assets:precompile
    fi
fi

# restart services
# If you copy this line make sure to add sudo in front of both commands
echo "Restarting Mastodon..."
systemctl reload mastodon-web && systemctl restart mastodon-{sidekiq,streaming}

# Clean cache
echo "Cleaning cache..."
sudo -u "$MASTODONUSER" RAILS_ENV=production ./bin/tootctl cache clear

# post-deploy migration
if [[ ! "$SKIP_MIGRATION" ]];then
    echo "Running post-deploy database migration..."
    sudo -u "$MASTODONUSER" RAILS_ENV=production bundle exec rails db:migrate
fi

echo "DONE!"

# Don't know where else to put this:

# https://github.com/mastodon/mastodon/pull/5039#discussion_r140416100
# Command to create schema: rake db:drop && rake db:create && rake db:migrate
# Drops and recreates database

# https://gitlab.com/gitlab-org/gitlab-foss/-/commit/83c8241160ed48ab066e2c5bd58d0914a745197c
# create migration: bundle exec rails g post_deployment_migration migration_name_here
