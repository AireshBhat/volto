# Creating a new Volto project

For using Volto for a project (aka use Volto as a library), You should use the
`create-volto-app`. It's a boilerplate generator that will provide you with a
basic files and folders structure to bootstrap a Volto site.

1. Open a terminal and execute:
```
$ npm -g i @plone/create-volto-app
```
It's recommended not to use yarn for install `create-volto-app`, use npm instead.

2. Create a new Volto app using the recently added command, providing the name
   of the new app (folder) to be created.
```
$ create-volto-app myvoltoapp
```

3. Change the directory to the `myvoltoapp`.
```
$ cd myvoltoapp
```

4. The project is ready to be started, `create-volto-app` already has run the
   dependencies install for you.
```
$ yarn start
```
will start the development server, compiling and leaving the app ready at:
http://localhost:3000
