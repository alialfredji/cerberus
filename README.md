##### Using `humble CLI` and `make CLI`
-------

Create `.env.local` variables, you find examples in `.env`. It is necessary for managing your cloud-formation distribution.


## Manage AWS cloud-formation stack
* Provide stack environment variables in .env.local
* `cf-stack/src/master.yml` contains full distribution configurations
* `cf-stack/src/lib` contains EC2 library utils like ebs volumes, security groups, iam users and s3 buckets
* `cf-stack/src/services` contains EC2 instances configurations. 
* Check `scripts/stack.sh` for more commands
- Deploy cf stack code artifacts to S3 bucket
    ````
    humble stack sync $ENV
    ````
* Create stack
    ````
    humble stack create $ENV
    ````
* Update stack
    ````
    humble stack update $ENV
    ````

## Deploy services to stack
* Provide stack environment variables in .env.local
* Check `scripts/deploy.sh` for more commands

Deploy service code artifacts to S3 bucket created by cf-stack:
```
>> humble deploy $SERVICE_NAME
```

## Manage PG EC2 instance
* `./s3-pull.sh` fetches latest instance code artifacts from S3 bucket created by cf-stack
* Check if PG disk is initialized
    ````
    make status
    ````
* Get more info about disk
    ````
    make info
    ````
* Mount disk to /docker-data
    ```
    make mount-disk
    ```
* Unmount disk from /docker-data
    ````
    make unmount-disk
    ````
* Start postgres machine
    ```
    make run-pg
    ```

## Change PG EC2 instance type

* Login to machine and run:
    ````
    make unmount-disk
    ````
* Modify `cf-stack/src/master.yml`, stop all running services except PG and deploy
* Modify `cf-stack/src/master.yml`, change PG ec2 instance type and deploy
* Login to machine and run:
    ````
     make mount-disk
     make run-pg
    ````
## Change PG EBS volume

* Login to machine and run:
    ````
    make unmount-disk
    ````
* Modify cf-stack master.yml, stop all running services except PG and deploy
* Modify cf-stack master.yml, change PG ebs volume size (NOTE! only higher size than the previous is allowed) and deploy
* Login to machine and run:
    ````
    make mount-disk
    make run-pg
    ````