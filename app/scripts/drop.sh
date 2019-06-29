#!/bin/bash
set -euo pipefail

function help() {
    echo "SHOW HELP..."
    exit 0
}

function dropServices() {
    echo ">> drop all infrastructure services"
    echo ">> (postgres)"
    humble stop postgres
    humble rm -f postgres
    exit 0
}

function dropWorkers() {
    echo ">> drop all queue workers"
    echo ">> (discovery, first-blood, post-tracker, profile-tracker)"
    humble drop -s discovery
    humble drop -s first-blood
    humble drop -s post-tracker
    humble drop -s profile-tracker
    exit 0
}


function dropService() {
    echo ">> drop service: $1"
    humble stop $1
    humble rm -f $1
}


# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        drop)
            shift
            ;;
        services)
            dropServices
            shift
            ;;
        workers)
            dropWorkers
            shift
            ;;
        -h|--help)
            echo "hoo"
            help
            shift
            ;;
        -s|--service)
            dropService $2
            shift
            shift
            ;;
        *)
            help
            shift
            ;;
    esac
done
