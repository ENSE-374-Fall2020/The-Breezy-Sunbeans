git remote add TheBreezySunbeans https://github.com/dhruvkmodi/ENSE374_TheBreezySunbeans.git
git branch -M main <- to make the main branch
git push -u TheBreezySunbeans main <-push the branch to remote (repository-name)

git fetch TheBreezySunbeans
git checkout main 
git pull    <- pull the main branch from remote

Files you need to add: .env
                        the init for the packages

database is oceanDB

User database
    Add photos functionality?

Messaging:
    Add a way to select a user to send a message to
    Page to show messages with a specific user
    
Meetings database
    Explore meetings has no funcitonality 
    Need a new to add a user to a meeting

    Explore meeting will have every other meeting than the ones you are in
    Clicking on an explore meeting will bring you to the meetup page where you can join if there is one user


    change home to be in the views folder

    added in public files
