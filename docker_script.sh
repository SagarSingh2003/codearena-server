#!/bin/bash

##############
# Author: Sagar Singh
# DATE : 21st June
##############

#debug mode
set -x 

#command to spin up the docker container

spin-playground-container(){

	docker run -p $1:3333 -p $2:5555  $3

}

spin-playground-container $1 $2 $3
