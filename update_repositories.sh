
#!/bin/sh
echo "Git Pull Dashboard"
cd tno_dashboard
git pull
cd ..

echo "Git Pull Filter Objects"
cd filter_objects
git pull
cd ..

echo "Git Pull Get Pointings"
cd get_pointings
git pull
cd ..
