#!/bin/bash

current_system=$(uname -s)
configbuddy_url=$(curl -s  -i https://api.github.com/repos/andreic92/configbuddy.v2/releases/latest | grep download_url | grep tar.gz | grep -i $current_system | sed 's/": /#/' | cut -d'#' -f2 | sed 's/"//g')

cd $HOME
mkdir __delete_me_configbuddy
cd __delete_me_configbuddy

wget $configbuddy_url -O configbuddy.tar.gz
tar -xf configbuddy.tar.gz

mv configbuddy.v2 $HOME
cd $HOME

echo -n "Please provide what kind of computer do you configure: (work/home) "
read configured_system
./configbuddy.v2 -c $HOME/.dotfiles/configs/$configured_system.yml -l debug -b
