#!/bin/bash

# get the path of the current script
install_packages_path=$(cd `dirname $0` && pwd)

# import functions
. $install_packages_path/functions.sh

# get distro and the associated pkgm
distro_name=$(get_distro_name)
installer=$(get_installer_by_distro_name)

# prepare installation workspace
install_directory="installation_workspace"

function prepare_installation_workspace() {
    cd ~
    mkdir -p $install_directory
    cd ~/$install_directory
}

function cleanup() {
    cd ~
    rm -r $install_directory
}

function install_common() {
    sudo $installer update
    
    is_kde_env=$(is_kde)
    if [ $is_kde_env -eq 0 ]; then
        sudo $installer install parcellite
    fi

    sudo $installer install cups
    sudo $installer install mc
    sudo $installer install vim
    sudo $installer install thunderbird
    sudo $installer install pidgin
    sudo $installer install clementine
    sudo $installer install tmux
    sudo $installer install atom
    sudo $installer install skype
    sudo $installer install samba
    sudo $installer install ngrep
    sudo $installer install ssh
    sudo $installer install tree
    sudo $installer install openvpn
    sudo $installer install guake
    sudo $installer install vlc
    sudo $installer install docker
    sudo $installer install sshpass
    sudo $installer install git
    sudo $installer install zip
    sudo $installer install unrar
    sudo $installer install smplayer
    sudo $installer install google-chrome
}

function install_debian_specific() {
    [ $distro_name != $DEBIAN_DISTRO_NAME ] && echo "Installation for Debian specific skipped!" && return
}

function install_redhat_specific() {
    [ $distro_name != $REDHAT_DISTRO_NAME ] && echo "Installation for RedHat specific skipped!" && return
    
    # rpmfusion
    sudo $installer install --nogpgcheck http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-$(rpm -E %fedora).noarch.rpm 
    sudo $installer install --nogpgcheck http://download1.rpmfusion.org/nonfree/fedora/rpmfusion-nonfree-release-$(rpm -E %fedora).noarch.rpm
    
    # virtualbox
    cd /etc/yum.repos.d/
    wget -N http://download.virtualbox.org/virtualbox/rpm/fedora/virtualbox.repo
    cd $install_directory
    sudo $installer update
    sudo $installer install binutils gcc make patch libgomp glibc-headers glibc-devel kernel-headers kernel-devel dkms
    sudo $installer install VirtualBox-5.0
    /usr/lib/virtualbox/vboxdrv.sh setup
    usermod -a -G vboxusers andreic

    # for atom deleting support
    sudo dnf install gvfs
    # skype
    sudo $installer install pulseaudio alsa-plugins-pulse alsa-plugins-pulse-32bit pavucontrol libv4l libv4l-32bit libv4l1-0 libv4l1-0-32bit libv4l2-0 libv4l2-0-32bit libv4lconvert0 libv4lconvert0-32bit libpulse0-32bit
    wget -N http://get.skype.com/go/getskype-linux-beta-suse
    mv getskype-linux-beta-suse skype.rpm
    sudo $installer install skype.rpm

    # atom
    wget -N https://atom.io/download/rpm
    mv rpm atom.rpm
    sudo $installer install atom.rpm

    # guake
    wget -N http://download.opensuse.org/repositories/X11:/terminals/openSUSE_Leap_42.1/x86_64/guake-0.7.2-7.1.x86_64.rpm
    sudo $installer install guake-0.7.2-7.1.x86_64.rpm

    # google chrome 
    wget -N https://dl.google.com/linux/linux_signing_key.pub
    sudo rpm --import linux_signing_key.pub
    wget -N https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
    sudo $installer install google-chrome-stable_current_x86_64.rpm


    # add chrome repo
    wget -N https://dl.google.com/linux/linux_signing_key.pub
    rpm --import linux_signing_key.pub

    # ia32libs
    sudo $installer install   alsa-lib.i686   alsa-plugins-oss.i686   alsa-plugins-pulseaudio.i686   alsa-plugins-pulseaudio.i686   arts.i686   audiofile.i686   bzip2-libs.i686   cairo.i686   cdk.i686   compat-expat1.i686   compat-libstdc++-33.i686   cyrus-sasl-lib.i686   dbus-libs.i686   esound-libs.i686   fltk.i686   freeglut.i686   glibc.i686   gtk2.i686   imlib.i686   lcms-libs.i686   lesstif.i686   libacl.i686   libao.i686   libattr.i686   libcap.i686   libdrm.i686   libexif.i686   libgnomecanvas.i686   libICE.i686   libieee1284.i686   libsigc++20.i686   libSM.i686   libtool-ltdl.i686   libusb.i686   libwmf-lite.i686   libwmf.i686   libX11.i686   libXau.i686   libXaw.i686   libXcomposite.i686   libXdamage.i686   libXdmcp.i686   libXext.i686   libXfixes.i686   libxkbfile.i686   libxml2.i686   libXmu.i686   libXp.i686   libXpm.i686   libXScrnSaver.i686   libXScrnSaver.i686   libxslt.i686   libXt.i686   libXtst.i686   libXv.i686   libXv.i686   libXxf86vm.i686   lzo.i686   mesa-libGL.i686   mesa-libGLU.i686   nas-libs.i686   nspluginwrapper.i686   openal-soft.i686   openldap.i686   pam.i686   popt.i686   pulseaudio-libs-glib2.i686   pulseaudio-libs.i686   pulseaudio-libs.i686   qt-x11.i686   qt.i686   redhat-lsb.i686   sane-backends-libs.i686   SDL.i686   svgalib.i686   unixODBC.i686   zlib.i686
}

function install_opensuse_specific() {
    [ $distro_name != $OPEN_SUSE_DISTRO_NAME ] && echo "Installation for OpenSUSE specific skipped!" && return

    # gstreamer - audio fix
    sudo $installer addrepo -f http://packman.inode.at/suse/openSUSE_Leap_42.1/ packman
    sudo $installer install gstreamer*
    
    # mpv - ffmpeg
    sudo $installer install mpv*
    sudo $installer install ffmpeg*
    sudo $installer install k3b-codecs ffmpeg lame phonon-backend-vlc phonon4qt5-backend-vlc vlc-codecs flash-player
    sudo $installer remove phonon-backend-gstreamer phonon4qt5-backend-gstreamer

    # ia32libs
    sudo $installer install -t pattern patterns-openSUSE-32bit

    # skype
    sudo $installer install pulseaudio alsa-plugins-pulse alsa-plugins-pulse-32bit pavucontrol libv4l libv4l-32bit libv4l1-0 libv4l1-0-32bit libv4l2-0 libv4l2-0-32bit libv4lconvert0 libv4lconvert0-32bit libpulse0-32bit
    wget -N http://get.skype.com/go/getskype-linux-beta-suse
    mv getskype-linux-beta-suse skype.rpm
    sudo $installer install skype.rpm

    # atom
    wget -N https://atom.io/download/rpm
    mv rpm atom.rpm
    sudo $installer install atom.rpm

    # guake
    wget -N http://download.opensuse.org/repositories/X11:/terminals/openSUSE_Leap_42.1/x86_64/guake-0.7.2-7.1.x86_64.rpm
    sudo $installer install guake-0.7.2-7.1.x86_64.rpm

    # google chrome 
    wget -N https://dl.google.com/linux/linux_signing_key.pub
    sudo rpm --import linux_signing_key.pub
    wget -N https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
    sudo $installer install google-chrome-stable_current_x86_64.rpm

    # install virtualbox:wq

}

prepare_installation_workspace

install_redhat_specific
install_debian_specific
install_opensuse_specific
install_common

cleanup
