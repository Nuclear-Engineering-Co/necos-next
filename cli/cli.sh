#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
FLAGS=()
ARGS=($@)
CMDFILE=""

for var in ${ARGS[@]}
do
    if [[ $var == -* ]]
    then
        FLAGS+=("$var")
    fi
done

for arg in ${FLAGS[@]}
do
    unset ARGS[arg]
done

# trim args
for arg in ${ARGS[@]}
do
  ARGS=(`echo $arg | sed 's/^ *//g'`)
done

if [ -z ${ARGS[0]} ]
then
  CMDFILE="usage"
else
  CMDFILE=${ARGS[0]}
fi

for FLAG in ${FLAGS[@]}; do
    case $FLAG in
      -H | --help | --usage | --version)
        CMDFILE="usage"
        ;;
      -D | --debug)
        DEBUG=true
        ;;
      --dev)
        export NODE_ENV=development
        ;;
      --ci)
        export NODE_ENV=ci
        ;;
    esac
done

CMDPATH="$SCRIPT_DIR/commands/$CMDFILE"

if [ -e "$CMDPATH" ]; then
    source "$CMDPATH"
else
    echo "Command not found: $CMDFILE"
fi
