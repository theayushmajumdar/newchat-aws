# newchat-aws

first we created an instance in AWS with the basic setups - used ubuntu , used t2.micro instance type and created a key pair and configured the instance - and then launched it,
Then I got into the terminal to connect to the instance and then pefformed all the commands to set the dependancies,
Installed nginx node and pm2 for a basic production.
Set my project's frontend to run with the backend with the build file ,
cloned the git repo made directory in the instance then installed all the dependancies required to run it , then started the pm2 , when successfully got connected , I configued my nginx to run the program in 5000 port (server) ,  then again ran it , and my project was deployed to the public ip with the help of nginx server.



                                                        :: For The Learning Curve ::
                                                      ---------------------------------
- Later on for the learning curve you can use AWS route 53 for hosting it on a domain name and enable a SSH to it for a secure connection .
- And then after you can practice multiple application hosting with different domains inside a single AWS EC2 Instance using nginx ,

ADV:
- You can dockerise the project and then deploy it and run it in an AWS EC2 Instance .
- you can push the docker image to an AWS ECR and then use it and run it in an external link of a task (from a task defination), of an AWS ECS cluster .

and many more .
Happy coding!
