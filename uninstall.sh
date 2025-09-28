#!/bin/bash
# uninstall.sh - Remove YankoviC CLI from PATH

set -e

# Remove yankovic symlink from /usr/local/bin if it exists
if [ -L /usr/local/bin/yankovic ]; then
  echo "Removing YankoviC from PATH..."
  sudo rm /usr/local/bin/yankovic
  echo "YankoviC CLI removed from /usr/local/bin."
else
  echo "No yankovic symlink found in /usr/local/bin. Nothing to remove."
fi

echo "Uninstall complete!"
