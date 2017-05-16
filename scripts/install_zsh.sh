#!/bin/bash
install_zsh () {
	if [ ! $install_zsh == "y" ]; then
		return
	fi

	# Test to see if zshell is installed.  If it is:
	if [ -f /bin/zsh -o -f /usr/bin/zsh ]; then
		# Clone my oh-my-zsh repository from GitHub only if it isn't already present
		if [[ ! -d $HOME/.oh-my-zsh/ ]]; then
			git clone http://github.com/robbyrussell/oh-my-zsh.git $HOME/.oh-my-zsh
		fi
		# Set the default shell to zsh if it isn't currently set to zsh
		if [[ ! $(echo $SHELL) == $(which zsh) ]]; then
			chsh -s $(which zsh)
		fi
	else
        # Get the installer by distro name and install zsh. See functions.sh
        [ -z $linux_installer ] && (echo "I am not compatible with the current distro!"; exit 1)
        sudo $linux_installer install zsh
        install_zsh
	fi
}
install_zsh='y'
linux_installer='apt'

install_zsh
