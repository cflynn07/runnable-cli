<img src="https://runnable.io/build/images/runnabear-head.png" width="150"> Runnable CLI (PRE-RELEASE ALPHA)
==========
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

The Runnable CLI is an interface to the Runnable Platform API. Supported features include log
tailing, terminal sessions, starting/stopping/restarting Servers, status inspection, etc. Use the
CLI to conveniently interact with Runnable from your development environment.

Overview
--------
```sh
  Usage: runnable [options] [command]


  Commands:

    logs               Tail the stdout of a Runnable server
    ssh                Open a remote terminal session in a Runnable server
    start              Start a Runnable server
    stop               Stop a Runnable server
    restart            Restart a Runnable server
    rebuild            Rebuild a Runnable server
    list               Fetch a list of Runnable servers
    status [options]   Show a Runnable server status
    watch              Watch a repository and automatically upload changed files to a Runnable server
    browse [runnabl]   Open a Runnable page in the default browser
    *

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```

Installation
------------
Requires Node.js and NPM. The easiest way to install Node.js is to use [brew](http://brew.sh/).
```sh
brew update
brew install node
```
Alternatively, you can download an bundled installer of Node.js for your OS  
https://nodejs.org/  

After installing Node:
```sh
npm install runnable-cli -g
```

Commands
--------

### runnable logs
`runnable logs`
![runnable_cli_logs](https://cloud.githubusercontent.com/assets/467885/12087919/bc55d624-b28b-11e5-9c6c-2c55ce5b8bf8.gif)

### runnable ssh
`runnable ssh`
![runnable_cli_ssh](https://cloud.githubusercontent.com/assets/467885/12087932/e20b899a-b28b-11e5-935c-b8524c253aae.gif)

### runnable start
```sh
/w/api git:master ❯❯❯ runnable start
https://runnable.io/CodeNow/api
Starting container...
```

### runnable stop
```sh
/w/api git:master ❯❯❯ runnable stop
https://runnable.io/CodeNow/api
Stopping container...
```

### runnable restart
```sh
/w/api git:master ❯❯❯ runnable stop
https://runnable.io/CodeNow/api
Restarting container...
```

### runnable rebuild
```sh
/w/api git:master ❯❯❯ runnable rebuild
https://runnable.io/CodeNow/api
Rebuilding container...
```

### runnable status
```sh
/w/api git:master ❯❯❯ runnable status
https://runnable.io/CodeNow/api
-------------------------------------------------------------------------------
branch name   | master
cid           | 692f0d2a2b2f337cfbe38887ecd7cb51c2e48cf054cee822e853c7c089b5284f
created by    | anandkumarpatel
github commit | 64d2385260c299e599ce0ed285308f2e0436bc4d
open ports    | 3000/tcp, 3001/tcp, 80/tcp
status        | running
uptime        | 9 hours
-------------------------------------------------------------------------------


/w/api git:master ❯❯❯ runnable status -e
https://runnable.io/CodeNow/api
-------------------------------------------------------------------------------
branch name   | master
cid           | 692f0d2a2b2f337cfbe38887ecd7cb51c2e48cf054cee822e853c7c089b5284f
created by    | anandkumarpatel
github commit | 64d2385260c299e599ce0ed285308f2e0436bc4d
open ports    | 3000/tcp, 3001/tcp, 80/tcp
status        | running
uptime        | 9 hours
-------------------------------------------------------------------------------
ENVIRONMENT VARIABLES
-------------------------------------------------------------------------------------------------
DOMAIN                          | runnable-angular-staging-codenow.runnableapp.com
FULL_API_DOMAIN                 | https://api-staging-codenow.runnableapp.com
GITHUB_CALLBACK_URL             | https://api-staging-codenow.runnableapp.com/auth/github/callback
GITHUB_CLIENT_ID                | ##################
GITHUB_CLIENT_SECRET            | #########################################
GITHUB_HOOK_URL                 | https://api-staging-codenow.runnableapp.com/actions/github
NODE_ENV                        | staging
ALLOW_ALL_CORS                  | true
DEBUG                           | none
NODE_PATH                       | ./lib
HACK_NEO4J                      | neo4j-staging-codenow.runnableapp.com
OPTIMUS_HOST                    | optimus-staging-codenow.runnableapp.com
NEO4J                           | http://neo4j-staging-codenow.runnableapp.com:7474
RABBITMQ_HOSTNAME               | ##############
RABBITMQ_PORT                   | ##############
RABBITMQ_USERNAME               | ################################################
RABBITMQ_PASSWORD               | ################################################
DATADOG_HOST                    | datadog-staging-codenow.runnableapp.com
MAVIS_HOST                      | http://mavis-staging-codenow.runnableapp.com
MONGO                           | mongodb://mongodb-staging-codenow.runnableapp.com/alpha
REDIS_IPADDRESS                 | #######
REDIS_PORT                      | #######
NAVI_HOST                       | http://10.8.6.59:32799
LOG_LEVEL                       | trace
LOG_LEVEL_STDOUT                | trace
LOGGLY_TOKEN                    | ######################################
NEWRELIC_NAME                   | api-staging
NEWRELIC_KEY                    | 338516e0826451c297d44dc60aeaf0a0ca4bfead
HYPERION                        | http://runnable-hyperion-codenow.runnableapp.com
SWARM_HOST                      | http://swarm-staging-codenow.runnableapp.com:2375
DOCKER_IMAGE_BUILDER_WEAVE_PATH | /usr/local/bin/weave
NEW_RELIC_APP_NAME              | api-staging
NEW_RELIC_LICENSE_KEY           | ######################################
NEW_RELIC_LOG_LEVEL             | fatal
NEW_RELIC_NO_CONFIG_FILE        | true
TEST_NEO4J                      | true
-------------------------------------------------------------------------------------------------
```

### runnable watch
```
```

Issues
------

License
-------
MIT
