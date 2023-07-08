# /usr/bin/bash

echo 'Operation started...'

git add .
read -p 'Commit message:' message
clear

echo "Commiting..."
git commit -m "${message}" &
wait

clear
echo "-----------------------------------------------------------"
echo "Ready to push..."
git push
