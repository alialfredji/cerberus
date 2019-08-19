#!/bin/bash
set -euo pipefail

function help() {
    echo "SHOW HELP..."
    exit 0
}

function syncQueueService() {
    TARGET=$1
    BUCKET="s3://${CODE_ARTIFACTS_BUCKET}/queue3-service/${TARGET}"
    SERVICE_PATH="${PWD}/dk-stacks/queue3-service/${TARGET}"

    # Check the service name
    if [ $TARGET = false ];
    then
        echo "Please specify which service you would like to deploy"
        exit -1
    fi

    # skip check when deploying all services
    if [ ${2-false} != "all" ];
    then
        echo "Deploy queue service: ${TARGET}?"
        echo ""
        enterToContinue
        echo ">> Release queue service: ${TARGET}"
    fi

    # clean existing build
    [ -d "${SERVICE_PATH}" ] && rm -rf "${SERVICE_PATH}"
    mkdir "${SERVICE_PATH}"

    # copy fresh sources
    echo "-- copy (${TARGET}) files"
    cp -rf "${PWD}/services/queue3/services/${TARGET}/" "${SERVICE_PATH}"

    # clean node modules
    [ -d "${SERVICE_PATH}/node_modules" ] && rm -rf "${SERVICE_PATH}/node_modules"
    
    # # upload artifacts
    echo "Upload (${TARGET}) files to s3 - ${BUCKET}"
    aws --profile ${AWS_CLI_PROFILE} s3 rm --recursive ${BUCKET}
    aws --profile ${AWS_CLI_PROFILE} s3 cp --exclude .env.local --recursive ${SERVICE_PATH} ${BUCKET}
    echo ">> done!"
}

# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        deploy-queue3)
            shift
            ;;
        queue-service)
            syncQueueService ${2}
            exit 0
            shift
            ;;
        --queue-all)
            echo "Deploy all the queue services?"
            enterToContinue
            syncQueueService discovery all
            syncQueueService first-blood all
            syncQueueService profile-tracker all
            syncQueueService post-tracker all
            exit 0
            shift
            shift
            ;;
        -h|--help)
            help
            shift
            ;;
        *)
            shift
            ;;
    esac
done