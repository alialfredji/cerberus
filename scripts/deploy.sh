#!/bin/bash
set -euo pipefail

function help() {
    echo "SHOW HELP..."
    exit 0
}

function syncQueueService() {
    TARGET=$1
    BUCKET="s3://${CODE_ARTIFACTS_BUCKET}/queue-service/${TARGET}"
    SERVICE_PATH="${PWD}/dk-stacks/queue-service/${TARGET}"

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
    [ -d "${SERVICE_PATH}" ] && rm -rf "${SERVICE_PATH}/services"
    mkdir "${SERVICE_PATH}/services"

    # copy fresh sources
    echo "-- copy (${TARGET}) files"
    cp -rf "${PWD}/services/queue/services/shared" "${SERVICE_PATH}/services/shared"
    cp -rf "${PWD}/services/queue/services/${TARGET}" "${SERVICE_PATH}/services/${TARGET}"

    # clean node modules
    [ -d "${SERVICE_PATH}/services/${TARGET}/node_modules" ] && rm -rf "${SERVICE_PATH}/services/${TARGET}/node_modules"
    
    # # upload artifacts
    echo "Upload (${TARGET}) files to s3 - ${BUCKET}"
    aws --profile ${AWS_CLI_PROFILE} s3 rm --recursive ${BUCKET}
    aws --profile ${AWS_CLI_PROFILE} s3 cp --exclude .env.local --recursive ${SERVICE_PATH} ${BUCKET}
    echo ">> done!"
}

function syncQueuePG() {
    TARGET="queue-pg"
    BUCKET="s3://${CODE_ARTIFACTS_BUCKET}/${TARGET}"
    SERVICE_PATH="${PWD}/dk-stacks/${TARGET}"

    echo "Deploy queue postgres database?"
    enterToContinue
    echo ">> Release queue postgres database: ${TARGET}"

    # Upload to S3
    echo "Upload (${TARGET}) files to s3 - ${BUCKET}"
    aws --profile ${AWS_CLI_PROFILE} s3 rm --recursive ${BUCKET}
    aws --profile ${AWS_CLI_PROFILE} s3 cp --exclude .env.local --exclude data/* --recursive ${SERVICE_PATH} ${BUCKET}
    echo ">> done!"
}

function syncStoragePG() {
    TARGET="storage-pg"
    BUCKET="s3://${CODE_ARTIFACTS_BUCKET}/${TARGET}"
    SERVICE_PATH="${PWD}/dk-stacks/${TARGET}"

    echo "Deploy storage postgres database?"
    enterToContinue
    echo ">> Release storage postgres database: ${TARGET}"

    # Upload to S3
    echo "Upload (${TARGET}) files to s3 - ${BUCKET}"
    aws --profile ${AWS_CLI_PROFILE} s3 rm --recursive ${BUCKET}
    aws --profile ${AWS_CLI_PROFILE} s3 cp --exclude .env.local --exclude data/* --recursive ${SERVICE_PATH} ${BUCKET}
    echo ">> done!"
}

# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        deploy)
            shift
            ;;
        queue-pg)
            syncQueuePG
            exit 0
            shift
            ;;
        queue-service)
            syncQueueService ${2}
            exit 0
            shift
            ;;
        storage-pg)
            syncStoragePG
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
            syncQueueService profile-builder all
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