#!/bin/bash
set -euo pipefail

function help() {
    echo "SHOW HELP..."
    exit 0
}

function syncStack() {
    ENV=$1
    BUCKET="s3://${STACK_BUCKET}/${STACK_NAME}/${ENV}"
    SERVICE_PATH="${PWD}/cf-stack/src"
    
    # Compose local properties with flag options
    while [ "$#" -ne 0 ] ; do
        case $ENV in
            dev|prod)
                echo "Deploy AWS Cloud formation stack: ${ENV}?"
                echo ""
                enterToContinue
                echo ""
                echo ">> Are you sure on enviroment: ${ENV}?"
                echo ""
                enterToContinue
                echo ">> Release cloud formation stack"

                # Upload to S3
                echo "Upload files to s3 - ${BUCKET}"
                aws --profile=${AWS_CLI_PROFILE} s3 cp --exclude "*" --include "*.yaml" --recursive ${SERVICE_PATH} ${BUCKET}
                echo ">> done!"
                shift
                ;;
            -h|--help)
                help
                shift
                ;;
            *)
                echo "[syncStack]: Invalid enviroment type"
                exit -1
                shift
                ;;
        esac
    done
}

# collect command info to execute
CMD=""

# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        stack)
            shift
            ;;
        sync)
            syncStack ${2-default}
            exit 0
            shift
            ;;
        create)
            CMD="./cf-stack/create-stack.sh ${2}"
            shift
            ;;
        update)
            CMD="./cf-stack/update-stack.sh ${2}"
            shift
            ;;
        --mode)
            CMD="${CMD} --mode ${2}"
            shift
            ;;
        --no-sync)
            CMD="${CMD} --no-sync"
            shift
            ;;
        --debug)
            CMD="${CMD} --debug"
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

# Executed command
$CMD