#!/bin/bash

installer="dnf -y" 

script_path=$(cd `dirname $0` && pwd)
sudo $installer update
sudo $installer install cups
sudo $installer install mc
sudo $installer install vim
sudo $installer install thunderbird
sudo $installer install pidgin
sudo $installer install clementine
sudo $installer install parcellite
sudo $installer install tmux
sudo $installer install atom
sudo $installer install skype
sudo $installer install samba
sudo $installer install ngrep
sudo $installer install ssh
sudo $installer install openvpn
sudo $installer install guake
sudo $installer install vlc
sudo $installer install docker
sudo $installer install sshpass
sudo $installer install git

# ia32libs
sudo $installer install   alsa-lib.i686   alsa-plugins-oss.i686   alsa-plugins-pulseaudio.i686   alsa-plugins-pulseaudio.i686   arts.i686   audiofile.i686   bzip2-libs.i686   cairo.i686   cdk.i686   compat-expat1.i686   compat-libstdc++-33.i686   cyrus-sasl-lib.i686   dbus-libs.i686   esound-libs.i686   fltk.i686   freeglut.i686   glibc.i686   gtk2.i686   imlib.i686   lcms-libs.i686   lesstif.i686   libacl.i686   libao.i686   libattr.i686   libcap.i686   libdrm.i686   libexif.i686   libgnomecanvas.i686   libICE.i686   libieee1284.i686   libsigc++20.i686   libSM.i686   libtool-ltdl.i686   libusb.i686   libwmf-lite.i686   libwmf.i686   libX11.i686   libXau.i686   libXaw.i686   libXcomposite.i686   libXdamage.i686   libXdmcp.i686   libXext.i686   libXfixes.i686   libxkbfile.i686   libxml2.i686   libXmu.i686   libXp.i686   libXpm.i686   libXScrnSaver.i686   libXScrnSaver.i686   libxslt.i686   libXt.i686   libXtst.i686   libXv.i686   libXv.i686   libXxf86vm.i686   lzo.i686   mesa-libGL.i686   mesa-libGLU.i686   nas-libs.i686   nspluginwrapper.i686   openal-soft.i686   openldap.i686   pam.i686   popt.i686   pulseaudio-libs-glib2.i686   pulseaudio-libs.i686   pulseaudio-libs.i686   qt-x11.i686   qt.i686   redhat-lsb.i686   sane-backends-libs.i686   SDL.i686   svgalib.i686   unixODBC.i686   zlib.i686


install_directory="install"
cd ~
mkdir -p $install_directory
cd $install_directory

# rpmfusion
wget -N http://download1.rpmfusion.org/free/fedora/rpmfusion-free-release-23.noarch.rpm
sudo $installer install rpmfusion-free-release-23.noarch.rpm
sudo $installer install gstreamer-plugins-ugly
sudo $installer install gstreamer-ffmpeg

# virtualbox
cd /etc/yum.repos.d/
wget -N http://download.virtualbox.org/virtualbox/rpm/fedora/virtualbox.repo
dnf update
dnf install binutils gcc make patch libgomp glibc-headers glibc-devel kernel-headers kernel-devel dkms
dnf install VirtualBox-5.0
/usr/lib/virtualbox/vboxdrv.sh setup
usermod -a -G vboxusers andreic

cd ~/$install_directory

wget -N https://dl.google.com/linux/linux_signing_key.pub
rpm --import linux_signing_key.pub
dnf update
dnf install google-chrome

cd ~
rm -r $install_directory
