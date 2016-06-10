#!/bin/bash

# get the script path
make_symlinks_path=$(cd `dirname $0` && pwd)

# import functions
. $make_symlinks_path/functions.sh

####### GLOBAL INIT #######
dir=~/.dotfiles                    # dotfiles directory
olddir=~/.dotfiles_old             # old dotfiles backup directory
common_dir="$dir/common"
#files="bashrc vimrc bash_aliases zshrc oh-my-zsh tmux.conf tmux.theme.sh"    # list of files/folders to symlink in homedir
# got from keyboard input
install_zsh="n"
configured_system=""

# function for reading the arguments from keyboard
function read_args_from_keyboard() {
    echo -n "Please provide what kind of computer do you configure: (work/home) "
    read configured_system

    if [ -z $configured_system ]; then
    	echo "Unable to configure the system! Incorrect configured system argument!"
    	exit 1
    fi

    echo -n "Do you want to install zsh? (y/n) "
    read install_zsh
}

# function for creating symlinks and save the old files
function create_symlinks() {
    mkdir -p $olddir

    final_old_dir="$olddir/original"
    number_of_dirs=`cd $olddir && ls -la | awk '{print $9}' | egrep "[a-zA-Z]+" | xargs -I '{}' bash -c '[ -d {} ] && echo "is_dir"' | wc -l`
    if [ $number_of_dirs -gt 0 ]; then
        last_version_index=`ls -la $olddir | egrep "^d" | awk '{print $9}' | egrep "^version.+" | xargs -I '{}' bash -c 'version_dir={} && echo ${version_dir:7}' | sort -n | tail -1`
        [ -z $last_version_index ] && last_version_index=0
        ((last_version_index=last_version_index+1))
        final_old_dir=$olddir"/version"$last_version_index
    fi
    echo -n "Creating $final_old_dir for backup of any existing dotfiles in ~ ..."
    mkdir -p $final_old_dir
    echo "done!"

    # change to the dotfiles directory
    configured_system_dir=$dir/$configured_system
    echo -n "Changing to the $configured_system_dir directory ..."
    cd $configured_system_dir
    echo "done"

    if [ -z $files ]; then
        files=`ls -la $configured_system_dir | awk '{print $9}' | egrep "[a-zA-Z]+"`
        files="$files `ls -la $common_dir | awk '{print $9}' | egrep '[a-zA-Z]+'`"
    fi
    printf "The following entries will be linked to the home directory:\n$files\n\n\n"
    # move any existing dotfiles in homedir to dotfiles_old directory, then create symlinks from the homedir to any files in the ~/dotfiles directory specified in $files
    for file in $files; do
        target_file=~/.$file
        if [[ "$file" =~ .*_$ ]]; then
            target_file=~/$(echo $file | cut -d'_' -f1)
        fi

    	echo "Moving $target_file from ~ to $final_old_dir"
    	mv $target_file $final_old_dir/
        echo "Creating symlink of $file in home directory ($target_file)..."

        file_path=$configured_system_dir/$file
    	if [ ! -f $file_path ]; then
    		file_path=$common_dir/$file
    	fi
    	ln -s $file_path $target_file
        echo ""
    done
}

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
        # Get the installer by distro name and install zsh. See functions.sh
        linux_installer=$(get_installer_by_distro_name)
        [ -z $linux_installer ] && (echo "I am not compatible with the current distro!"; exit 1)
        sudo $linux_installer install zsh
        install_zsh
	fi
}

read_args_from_keyboard
create_symlinks
install_zsh
