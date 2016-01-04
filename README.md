<img src="https://runnable.io/build/images/runnabear-head.png" width="150"> Runnable CLI (PRE-RELEASE ALPHA)
==========

The Runnable CLI is an interface to the Runnable Platform API. Supported features include log
tailing, terminal sessions, starting/stopping/restarting Servers, status inspection, etc. Use the
CLI to interact conveniently with Runnable from your development environment.

Overview
--------
```sh
/w/runnable-cli git:master ❯❯❯ runnable                                                                   ✱ ◼

  Usage: runnable [options] [command]


  Commands:

    logs             Tail the stdout of a Runnable server
    ssh              Open a remote terminal session in a Runnable server
    start            Start a Runnable server
    stop             Stop a Runnable server
    restart          Restart a Runnable server
    rebuild          Rebuild a Runnable server
    list
    status           Show a Runnable server status
    browse [target]  Open a Runnable page in the default browser
    *
    help [cmd]       display help for [cmd]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -e             Show the Runnable server environment variables
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

Usage
-----

Issues
------

License
-------
