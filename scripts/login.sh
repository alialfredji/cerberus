#!/bin/bash
set -euo pipefail

function help() {
    echo "SHOW HELP..."
    exit 0
}

# Compose local properties with flag options
while [ "$#" -ne 0 ] ; do
    case "$1" in
        login)
            ssh -i ${EC2_KEY_PAIR_PATH} "ubuntu@${2:-$EC2_TARGET}"
            shift
            ;;
        -h|--help)
            echo "hoo"
            help
            shift
            ;;
        *)
            help
            shift
            ;;
    esac
done
