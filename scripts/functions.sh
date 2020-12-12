export REDHAT_DISTRO_NAME="redhat"
export DEBIAN_DISTRO_NAME="debian"
export OPEN_SUSE_DISTRO_NAME="opensuse"

function get_distro_name() {
    if [[ -f /etc/redhat-release ]]; then
        echo $REDHAT_DISTRO_NAME
        return
    fi
    if [[ -f /etc/debian_version ]]; then
        echo $DEBIAN_DISTRO_NAME
        return
    fi
    if [[ -f /etc/os-release ]]; then
        echo $OPEN_SUSE_DISTRO_NAME
    fi
}

function get_installer_by_distro_name() {
    linux_distro=$(get_distro_name)
    [ $linux_distro == $REDHAT_DISTRO_NAME ] && (echo "dnf")
    [ $linux_distro == $DEBIAN_DISTRO_NAME ] && (echo "apt")
    [ $linux_distro == $OPEN_SUSE_DISTRO_NAME ] && (echo "zypper")
}

function is_kde() {
    [ $XDG_CURRENT_DESKTOP == "KDE" ] && echo 1 && return
    echo 0
}


export -f get_distro_name
export -f get_installer_by_distro_name
export -f is_kde
