#!/bin/bash
set -euo pipefail

NEWLINE=$'\n'
ATTACH_LOGS=false
BOOT_SERVICES=""
OVERRIDE_ENV=""

function help() {
    echo "SHOW HELP..."
    exit 0
}

function bootServices() {
    echo ">> boot all infrastructure services"
    echo ">> (postgres)"
    humble stop postgres
    humble rm -f postgres
    humble up -d postgres
    exit 0
}

function bootWorkers() {
    echo ">> boot all queue workers"
    echo ">> (discovery, first-blood, post-tracker, profile-tracker)"
    humble info
    humble boot -s discovery
    humble boot -s first-blood
    humble boot -s post-tracker
    humble boot -s profile-tracker
    humble logs -f
    exit 0
}


# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        boot)
            shift
            ;;
        services)
            bootServices
            shift
            ;;
        workers)
            bootWorkers
            shift
            ;;
        -h|--help|help|foo)
            help
            shift
            ;;
        -l|--logs)
            ATTACH_LOGS=true
            shift
            ;;
        -e|--env)
            OVERRIDE_ENV="${OVERRIDE_ENV} -e $2"
            shift
            shift
            ;;
        -s|--service)
            BOOT_SERVICES="${BOOT_SERVICES} $2"
            shift
            shift
            ;;
        *)
            help
            shift
            ;;
    esac
done

# if [ "${OVERRIDE_ENV}" != "" ] ; then
#     echo "${OVERRIDE_ENV}" > .env.override
# fi

if [ ${BOOT_SERVICES} != "" ] ; then
    echo ">> boot service: $BOOT_SERVICES"
    humble stop $BOOT_SERVICES
    humble rm -f $BOOT_SERVICES
    humble up -d $BOOT_SERVICES
fi

# if [ "${OVERRIDE_ENV}" != "" ] ; then
#     rm .env.override
# fi

if [ ${ATTACH_LOGS} = true ] ; then
    humble logs -f ${BOOT_SERVICES}
fi
