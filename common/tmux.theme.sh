#### COLOUR

tm_icon="☀"
tm_color_active=colour82
tm_color_inactive=colour241
tm_color_feature=colour10
tm_color_music=colour10
tm_active_border_color=colour10
tm_activity_fg_color=black
tm_activity_bg_color=red

# separators
tm_separator_left_bold="◀"
tm_separator_left_thin="❮"
tm_separator_right_bold="▶"
tm_separator_right_thin="❯"

set -g status-left-length 32
set -g status-right-length 150
set -g status-interval 1

#set the activity indicator colour
set-window-option -g window-status-activity-style fg=$tm_activity_fg_color,bg=$tm_activity_bg_color

# default statusbar colors
set-option -g status-style fg=$tm_color_active,bg=default

# default window title colors
set-window-option -g window-status-current-style fg=$tm_color_active,bg=$tm_activity_fg_color
set -g window-status-format "#I #W #F"

# active window title colors
set-window-option -g window-status-style fg=$tm_color_inactive,bg=default
set-window-option -g window-status-current-format "#[bold]#I #W #F"

# pane border
set-option -g pane-border-style fg=$tm_color_inactive
set-option -g pane-active-border-style fg=$tm_active_border_color

# message text
set-option -g message-style fg=$tm_color_active,bg=default

# pane number display
set-option -g display-panes-active-colour $tm_color_active
set-option -g display-panes-colour $tm_color_inactive

# clock - prefix + t
set-window-option -g clock-mode-colour $tm_color_active

#tm_tunes="#[fg=$tm_color_music]#(osascript ~/.dotfiles/applescripts/tunes.scpt)"
#tm_battery="#(~/.dotfiles/bin/battery_indicator.sh)"

#tm_date="#[fg=$tm_color_active] #(~/.dotfiles/common/bin/cmus_current_song) | %d/%m/%Y %H:%M:%S | CPU: #(~/.dotfiles/common/bin/cpu_usage | head -1) | IP: #(~/.dotfiles/common/bin/iface | head -1)"
tm_date="#[fg=$tm_color_active] %d/%m/%Y %H:%M:%S"
#tm_host="#[fg=$tm_color_feature,bold]#h"
#tm_session_name="#[fg=$tm_color_feature,bold]$tm_icon #S"

#set -g status-left $tm_session_name' '
#set -g status-right $tm_tunes' '$tm_date' '$tm_host
set -g status-right $tm_date
