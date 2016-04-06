#!/bin/bash

#####-------------EXPORTS------------#####
export SOFTS_PATH=/media/personal_drive/Programming/development_softwares/linux/softs
export MAVEN_HOME=$SOFTS_PATH/apache-maven-3.2.5
export M2_HOME=$MAVEN_HOME
export M2=$M2_HOME$/bin
export MAVEN_OPTS="-Xms256m -Xmx512m"
export ECLIPSE_HOME=/media/personal_drive/Programming/development_softwares/linux/eclipse
export ANT_HOME=$SOFTS_PATH/apache-ant-1.9.6
export TOMCAT_HOME=$SOFTS_PATH/apache-tomcat-7.0.42
export JAVA_HOME=$SOFTS_PATH/jdk1.8.0_73
export GRADLE_HOME=$SOFTS_PATH/gradle-2.0
export PATH=${PATH}:${JAVA_HOME}/bin:${ANT_HOME}/bin:${MAVEN_HOME}/bin:${TOMCAT_HOME}/bin:${GRADLE_HOME}/bin
export EDITOR="vim"
#####-------------ALIASES------------#####
alias ee="($ECLIPSE_HOME/eclipse)"
alias ll='ls -l'
alias l='ls -alF'
alias ..="cd .."
alias mysql_start="sudo service mysql start; mysql --user=root --password=root shelf"
alias mvnci="mvn clean install"
alias patch_grub_timeout="sudo sed -i 's/timeout=10/timeout=1/g' /boot/grub/grub.cfg"
