# /usr/bin/bash

echo 'Operation started...'

git add .
read -p 'Commit message:' message

git commit -m "${message}"

git push
