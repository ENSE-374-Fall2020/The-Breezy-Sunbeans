git remote add TheBreezySunbeans https://github.com/dhruvkmodi/ENSE374_TheBreezySunbeans.git
git branch -M main <- to make the main branch
git push -u TheBreezySunbeans main <-push the branch to remote (repository-name)

git fetch TheBreezySunbeans
git checkout main 
git pull    <- pull the main branch from remote

Files you need to add: .env
                        the init for the packages

database is oceanDB


TODO
    change home to be in the views folder and not the views/home folder
    take out the profilehtml folder from project

User database:
    Add photos functionality?

Messaging:
    Add a way to select a user to send a message to
    Page to show messages with a specific user
    
Meetings database:


