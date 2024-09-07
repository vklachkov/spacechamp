image_name=space-fest-image;
container_name=space-fest-cont;

sudo docker stop $container_name
sudo docker rm $container_name
sudo docker build . -t $image_name
# TODO: нужно ли высовывать порт?
sudo docker run -d -p 4200:80 --name $container_name $image_name:latest