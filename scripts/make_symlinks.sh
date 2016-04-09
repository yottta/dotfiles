#!/bin/bash

dir=~/.dotfiles                    # dotfiles directory
olddir=~/.dotfiles_old             # old dotfiles backup directory
common_dir="$dir/common"
#files="bashrc vimrc bash_aliases zshrc oh-my-zsh tmux.conf tmux.theme.sh"    # list of files/folders to symlink in homedir

###############################
echo -n "Please provide what kind of computer do you configure: (work/home) "
read configured_system

if [ -z $configured_system ]; then
	echo "Unable to configure the system! Incorrect configured system argument!"
	exit 1
fi

echo -n "Do you want to install zsh? (y/n) "
read install_zsh
###############################

# create dotfiles_old in homedir
echo -n "Creating $olddir for backup of any existing dotfiles in ~ ..."
mkdir -p $olddir
echo "Done"

# change to the dotfiles directory
configured_system_dir=$dir/$configured_system
echo -n "Changing to the $configured_system_dir directory ..."
cd $configured_system_dir
echo "done"

if [ -z $files ]; then
    files=`ls -la $configured_system_dir | awk '{print $9}' | egrep "[a-zA-Z]+"`
    files="$files `ls -la $common_dir | awk '{print $9}' | egrep '[a-zA-Z]+'`"
fi

# move any existing dotfiles in homedir to dotfiles_old directory, then create symlinks from the homedir to any files in the ~/dotfiles directory specified in $files
for file in $files; do
	echo "Moving any existing dotfiles from ~ to $olddir"
	mv ~/.$file $olddir/
	echo "Creating symlink to $file in home directory."
	file_path=$configured_system_dir/$file
	if [ ! -f $file_path ]; then
		file_path=$common_dir/$file
	fi
	ln -s $file_path ~/.$file
done


install_zsh () {
	if [ ! $install_zsh == "y" ]; then
		return
	fi

	# Test to see if zshell is installed.  If it is:
	if [ -f /bin/zsh -o -f /usr/bin/zsh ]; then
		# Clone my oh-my-zsh repository from GitHub only if it isn't already present
		if [[ ! -d $dir/oh-my-zsh/ ]]; then
			git clone http://github.com/robbyrussell/oh-my-zsh.git
		fi
		# Set the default shell to zsh if it isn't currently set to zsh
		if [[ ! $(echo $SHELL) == $(which zsh) ]]; then
			chsh -s $(which zsh)
		fi
	else
		# If zsh isn't installed, get the platform of the current machine
		platform=$(uname);
		# If the platform is Linux, try an apt-get to install zsh and then recurse
		if [[ $platform == 'Linux' ]]; then
			if [[ -f /etc/redhat-release ]]; then
				sudo dnf install zsh
			        install_zsh
		        fi
		        if [[ -f /etc/debian_version ]]; then
        			sudo apt-get install zsh
				install_zsh
		        fi
		elif [[ $platform == 'Darwin' ]]; then
		        echo "Please install zsh, then re-run this script!"
	        	exit
		fi
	fi
}

install_zsh
