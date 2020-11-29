git remote add TheBreezySunbeans https://github.com/dhruvkmodi/ENSE374_TheBreezySunbeans.git
git branch -M main <- to make the main branch
git push -u TheBreezySunbeans main <-push the branch to remote (repository-name)

git fetch TheBreezySunbeans
git checkout main
git pull <- pull the main branch from remote

Files you need to add: .env
the init for the packages

database is oceanDB

TODO

User:
Does intrests work?
Add photos functionality?

Messaging:
    Add a way to select a user to send a message to
    Page to show messages with a specific user

Meetings:
    Add functionaltiy to find all users with same inertests as you, pick a random one, and satrt a meeting witht hem
        So createMeeting, but with preset user2 and type

    add ability to leave a meeting instead of delete
        if user1 leaves meeting, change user2 to become user1
        can leave a meeting if there are more than one people in the meeting

Hayden (nov/26)
Changes:
-removed the username showing up twice
-Changed the name of the user showing up instead of the username
